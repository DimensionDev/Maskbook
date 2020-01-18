import { AbiItem } from 'web3-utils'
import { RedPacketAPI, WalletAPI } from './types'
import { onClaimResult, onCreationResult, onExpired, onRefundResult } from './red-packet-fsm'
import { onWalletBalanceUpdated } from './wallet'
import { web3 } from './web3'
import HappyRedPacketABI from '../../contracts/HappyRedPacket.json'
import IERC20ABI from '../../contracts/IERC20.json'
import { HappyRedPacket } from '../../contracts/HappyRedPacket'
import { IERC20 } from '../../contracts/IERC20'
import { TransactionObject } from '../../contracts/types'
import { RedPacketTokenType } from '../../database/Plugins/Wallet/types'
import { asyncTimes, pollingTask } from '../../utils/utils'

const RED_PACKET_CONTRACT_ADDRESS = '0x19D0b6091D37Bc262ecC460ee4Bd57DBBD68754C'

function createRedPacketContract(address: string) {
    return (new web3.eth.Contract(HappyRedPacketABI as AbiItem[], address) as unknown) as HappyRedPacket
}

function createERC20Contract(address: string) {
    return (new web3.eth.Contract(IERC20ABI as AbiItem[], address) as unknown) as IERC20
}

async function createTxPayload<T>(tx: TransactionObject<T>, value?: string) {
    const from = await web3.eth.getCoinbase()
    const [gas, gasPrice] = await Promise.all([
        tx.estimateGas({
            value,
            from,
        }),
        web3.eth.getGasPrice(),
    ])
    return {
        from,
        gas,
        gasPrice,
        value,
    }
}

export const redPacketAPI: RedPacketAPI = {
    dataSource: 'real',
    async create(
        hashes: string[],
        isRandom: boolean,
        duration: number,
        seed: number[],
        message: string,
        name: string,
        token_type: RedPacketTokenType,
        token_addr: string,
        total_tokens: bigint,
    ) {
        const contract = createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
        const tx = contract.methods.create_red_packet(
            hashes,
            isRandom,
            duration,
            seed,
            message,
            name,
            token_type,
            token_addr,
            total_tokens.toString(),
        )
        return new Promise(async (resolve, reject) => {
            tx.send(await createTxPayload(tx, total_tokens.toString()))
                .on('transactionHash', async (hash: string) =>
                    resolve({
                        create_nonce: (await web3.eth.getTransaction(hash)).nonce,
                        create_transaction_hash: hash,
                    }),
                )
                .on('error', (err: Error) => reject(err))
        })
    },
    async claim(id: string, password: string, recipient: string, validation: string) {
        const contract = createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
        const tx = contract.methods.claim(id, password, recipient, validation)
        return new Promise(async (resolve, reject) => {
            tx.send(await createTxPayload(tx))
                .on('transactionHash', async (hash: string) =>
                    resolve({
                        claim_transaction_hash: hash,
                    }),
                )
                .on('error', (err: Error) => reject(err))
        })
    },
    async watchClaimResult(transactionHash: string) {
        const contract = createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
        const { blockNumber } = await web3.eth.getTransaction(transactionHash)

        if (!blockNumber) {
            return
        }
        asyncTimes(10, async () => {
            const evs = await contract.getPastEvents('ClaimSuccess', {
                fromBlock: blockNumber,
                toBlock: blockNumber,
            })
            const claimSuccessEv = evs.find(ev => ev.transactionHash === transactionHash)

            if (claimSuccessEv) {
                const { id, claimer, claimed_value } = claimSuccessEv.returnValues as {
                    id: string
                    claimer: string
                    claimed_value: string
                    token_address: string
                }
                onClaimResult(transactionHash, {
                    type: 'success',
                    claimed_value: BigInt(claimed_value),
                    claimer,
                    red_packet_id: id,
                })
                return true
            }
        })
            .then(results => {
                if (!results.some(r => r)) {
                    onClaimResult(transactionHash, {
                        type: 'failed',
                        reason: 'timeout',
                    })
                }
            })
            .catch(e => {
                onClaimResult(transactionHash, {
                    type: 'failed',
                    reason: e.message,
                })
            })
    },
    async watchCreateResult(transactionHash: string) {
        const contract = createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
        const { blockNumber } = await web3.eth.getTransaction(transactionHash)

        if (!blockNumber) {
            return
        }
        asyncTimes(10, async () => {
            const evs = await contract.getPastEvents('CreationSuccess', {
                fromBlock: blockNumber,
                toBlock: blockNumber,
            })
            const creationSuccessEv = evs.find(ev => ev.transactionHash === transactionHash)

            if (creationSuccessEv) {
                const { total, id, creator, creation_time } = creationSuccessEv.returnValues as {
                    total: string
                    id: string
                    creator: string
                    creation_time: string
                    token_address: string
                }
                onCreationResult(transactionHash, {
                    type: 'success',
                    block_creation_time: new Date(parseInt(creation_time) * 1000),
                    red_packet_id: id,
                    creator,
                    total: BigInt(total),
                })
                return true
            }
        })
            .then(results => {
                if (!results.some(r => r)) {
                    onCreationResult(transactionHash, {
                        type: 'failed',
                        reason: 'timeout',
                    })
                }
            })
            .catch(e => {
                onCreationResult(transactionHash, {
                    type: 'failed',
                    reason: e.message,
                })
            })
    },
    async watchExpired(id: string) {
        pollingTask(async () => {
            const { expired } = await this.checkAvailability(id)

            if (expired) {
                onExpired(id)
                return true
            }
            return false
        })
    },
    async checkAvailability(id: string) {
        const contract = createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
        const tx = contract.methods.check_availability(id)
        const { balance, claimed, expired, token_address, total } = await tx.call(await createTxPayload(tx))
        return {
            balance: BigInt(balance),
            claimedCount: parseInt(claimed),
            expired,
            token_address,
            totalCount: parseInt(total),
        }
    },
    async refund(id: string) {
        const contract = createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
        const tx = contract.methods.refund(id)

        return new Promise<{ refund_transaction_hash: string }>(async (resolve, reject) => {
            tx.send(await createTxPayload(tx))
                .on('transactionHash', (hash: string) =>
                    resolve({
                        refund_transaction_hash: hash,
                    }),
                )
                .on('error', (error: Error) => reject(error))
        })
    },
    async watchRefundResult(transactionHash: string) {
        const contract = createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
        const { blockNumber } = await web3.eth.getTransaction(transactionHash)

        if (!blockNumber) {
            return
        }
        asyncTimes(10, async () => {
            const evs = await contract.getPastEvents('RefundSuccess', {
                fromBlock: blockNumber,
                toBlock: blockNumber,
            })
            const refundSuccessEv = evs.find(ev => ev.transactionHash === transactionHash)

            if (refundSuccessEv) {
                const { id, remaining_balance } = refundSuccessEv.returnValues as {
                    id: string
                    token_address: string
                    remaining_balance: string
                }

                onRefundResult(id, {
                    remaining_balance: BigInt(remaining_balance),
                })
            }
        })
    },
    async checkClaimedList(id: string) {
        const contract = createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
        const tx = contract.methods.check_claimed_list(id)
        const map = new Map<string, bigint>()
        const result = await tx.call(await createTxPayload(tx))
        result.claimer_addrs.forEach((addr, index) => map.set(addr, BigInt(result.claimed_list[index])))
        return map
    },
}

export const walletAPI: WalletAPI = {
    dataSource: 'real',
    watchWalletBalance(address) {
        pollingTask(async () => {
            onWalletBalanceUpdated(address, BigInt(await web3.eth.getBalance(address)))
            return false
        })
    },
    async approveERC20Token(address: string, amount: bigint) {
        const contract = createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
        const erc20Contract = createERC20Contract(address)
        const tx = erc20Contract.methods.approve(contract.options.address, amount.toString())

        return new Promise<{ erc20_approve_transaction_hash: string; erc20_approve_value: bigint }>(
            async (resolve, reject) => {
                tx.send(await createTxPayload(tx))
                    .on('transactionHash', (hash: string) =>
                        resolve({
                            erc20_approve_transaction_hash: hash,
                            erc20_approve_value: amount,
                        }),
                    )
                    .on('error', (error: Error) => reject(error))
            },
        )
    },
}
