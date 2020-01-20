import { AbiItem } from 'web3-utils'
import { RedPacketAPI, WalletAPI } from './types'
import { onClaimResult, onCreationResult, onExpired, onRefundResult } from './red-packet-fsm'
import { onWalletBalanceUpdated, onWalletERC20TokenBalanceUpdated } from './wallet'
import { web3 } from './web3'
import HappyRedPacketABI from '../../contracts/HappyRedPacket.json'
import IERC20ABI from '../../contracts/IERC20.json'
import { HappyRedPacket } from '../../contracts/HappyRedPacket'
import { IERC20 } from '../../contracts/IERC20'
import { TransactionObject } from '../../contracts/types'
import { RedPacketTokenType } from '../../database/Plugins/Wallet/types'
import { asyncTimes, pollingTask } from '../../utils/utils'
import { createWalletDBAccess } from '../../database/Plugins/Wallet/Wallet.db'
import { createTransaction } from '../../database/helpers/openDB'

// TODO: should not be a constant. should respect the value in the red packet record
const RED_PACKET_CONTRACT_ADDRESS = '0x4280fC3851CBaC3160e537850bD02bA78e11F6bf'

function createRedPacketContract(address: string) {
    return (new web3.eth.Contract(HappyRedPacketABI as AbiItem[], address) as unknown) as HappyRedPacket
}

function createERC20Contract(address: string) {
    return (new web3.eth.Contract(IERC20ABI as AbiItem[], address) as unknown) as IERC20
}

async function createTxPayload<T>(address: string, tx: TransactionObject<T>, value?: string) {
    const [gas, gasPrice] = await Promise.all([
        tx.estimateGas({
            value,
            from: address,
        }),
        web3.eth.getGasPrice(),
    ])
    return {
        from: address,
        gas,
        gasPrice,
        value,
    }
}

export const redPacketAPI: RedPacketAPI = {
    dataSource: 'real',
    async create(
        ____sender__addr: string,
        hash_of_password: string,
        quantity: number,
        isRandom: boolean,
        duration: number,
        seed: string,
        message: string,
        name: string,
        token_type: RedPacketTokenType,
        token_addr: string,
        total_tokens: bigint,
    ) {
        const contract = createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
        const tx = contract.methods.create_red_packet(
            hash_of_password,
            quantity,
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
            let txHash = ''

            tx.send(
                await createTxPayload(
                    ____sender__addr,
                    tx,
                    token_type === RedPacketTokenType.eth ? total_tokens.toString() : undefined,
                ),
            )
                .on('transactionHash', (hash: string) => {
                    txHash = hash
                })
                .on('receipt', async () => {
                    resolve({
                        create_nonce: (await web3.eth.getTransaction(txHash)).nonce,
                        create_transaction_hash: txHash,
                    })
                })
                .on('error', (err: Error) => reject(err))
        })
    },
    async claim(id, password: string, recipient: string, validation: string) {
        const contract = createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
        const tx = contract.methods.claim(id.redPacketID, password, recipient, validation)
        return new Promise(async (resolve, reject) => {
            let txHash = ''

            tx.send(await createTxPayload(recipient, tx))
                .on('transactionHash', async (hash: string) => {
                    txHash = hash
                })
                .on('receipt', () => {
                    resolve({
                        claim_transaction_hash: txHash,
                    })
                })
                .on('error', (err: Error) => reject(err))
        })
    },
    async watchClaimResult(id) {
        const contract = createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
        const { blockNumber } = await web3.eth.getTransaction(id.transactionHash)

        if (!blockNumber) {
            return
        }
        asyncTimes(10, async () => {
            const evs = await contract.getPastEvents('ClaimSuccess', {
                fromBlock: blockNumber,
                toBlock: blockNumber,
            })
            const claimSuccessEv = evs.find(ev => ev.transactionHash === id.transactionHash)

            if (claimSuccessEv) {
                const { id: return_id, claimer, claimed_value } = claimSuccessEv.returnValues as {
                    id: string
                    claimer: string
                    claimed_value: string
                    token_address: string
                }
                onClaimResult(id, {
                    type: 'success',
                    claimed_value: BigInt(claimed_value),
                    claimer,
                    red_packet_id: return_id,
                })
                return true
            }
        })
            .then(results => {
                if (!results.some(r => r)) {
                    onClaimResult(id, {
                        type: 'failed',
                        reason: 'timeout',
                    })
                }
            })
            .catch(e => {
                onClaimResult(id, {
                    type: 'failed',
                    reason: e.message,
                })
            })
    },
    async watchCreateResult(id) {
        const contract = createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
        const { blockNumber } = await web3.eth.getTransaction(id.transactionHash)

        if (!blockNumber) {
            return
        }
        asyncTimes(10, async () => {
            const evs = await contract.getPastEvents('CreationSuccess', {
                fromBlock: blockNumber,
                toBlock: blockNumber,
            })
            const creationSuccessEv = evs.find(ev => ev.transactionHash === id.transactionHash)

            if (creationSuccessEv) {
                const { total, id: return_id, creator, creation_time } = creationSuccessEv.returnValues as {
                    total: string
                    id: string
                    creator: string
                    creation_time: string
                    token_address: string
                }
                onCreationResult(id, {
                    type: 'success',
                    block_creation_time: new Date(parseInt(creation_time) * 1000),
                    red_packet_id: return_id,
                    creator,
                    total: BigInt(total),
                })
                return true
            }
        })
            .then(results => {
                if (!results.some(r => r)) {
                    onCreationResult(id, {
                        type: 'failed',
                        reason: 'timeout',
                    })
                }
            })
            .catch(e => {
                onCreationResult(id, {
                    type: 'failed',
                    reason: e.message,
                })
            })
    },
    async watchExpired(id) {
        pollingTask(async () => {
            const { expired } = await this.checkAvailability(id)

            if (expired) {
                onExpired(id)
                return true
            }
            return false
        })
    },
    async checkAvailability(id) {
        const contract = createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
        const tx = contract.methods.check_availability(id.redPacketID)
        const { balance, claimed, expired, token_address, total } = await tx.call(await createTxPayload('', tx))
        return {
            balance: BigInt(balance),
            claimedCount: parseInt(claimed),
            expired,
            token_address,
            totalCount: parseInt(total),
        }
    },
    async refund(id) {
        const sender = await createTransaction(
            await createWalletDBAccess(),
            'readonly',
        )('RedPacket')
            .objectStore('RedPacket')
            .get(id.redPacketID)

        const contract = createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
        const tx = contract.methods.refund(id.redPacketID)

        return new Promise<{ refund_transaction_hash: string }>(async (resolve, reject) => {
            let txHash = ''
            tx.send(await createTxPayload(sender!.sender_address!, tx))
                .on('transactionHash', (hash: string) => {
                    txHash = hash
                })
                .on('receipt', () => {
                    resolve({
                        refund_transaction_hash: txHash,
                    })
                })
                .on('error', (error: Error) => reject(error))
        })
    },
    async watchRefundResult(id) {
        const contract = createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
        const { blockNumber } = await web3.eth.getTransaction(id.transactionHash)

        if (!blockNumber) {
            return
        }
        asyncTimes(10, async () => {
            const evs = await contract.getPastEvents('RefundSuccess', {
                fromBlock: blockNumber,
                toBlock: blockNumber,
            })
            const refundSuccessEv = evs.find(ev => ev.transactionHash === id.transactionHash)

            if (refundSuccessEv) {
                const { remaining_balance } = refundSuccessEv.returnValues as {
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
}

export const walletAPI: WalletAPI = {
    dataSource: 'real',
    addWalletPrivateKey(address: string, privateKey: string) {
        web3.eth.accounts.wallet.add('0x' + privateKey)
    },
    watchWalletBalance(address) {
        pollingTask(async () => {
            onWalletBalanceUpdated(address, BigInt(await web3.eth.getBalance(address)))
            return false
        })
    },
    watchERC20TokenBalance(walletAddress, token) {
        const erc20Contract = createERC20Contract(token)
        pollingTask(async () => {
            onWalletERC20TokenBalanceUpdated(
                walletAddress,
                token,
                BigInt(await erc20Contract.methods.balanceOf(walletAddress).call()),
            )
            return false
        })
    },
    async approveERC20Token(sender_address: string, address: string, amount: bigint) {
        const erc20Contract = createERC20Contract(address)
        const tx = erc20Contract.methods.approve(RED_PACKET_CONTRACT_ADDRESS, amount.toString())

        return new Promise<{ erc20_approve_transaction_hash: string; erc20_approve_value: bigint }>(
            async (resolve, reject) => {
                let txHash: string = ''

                tx.send(await createTxPayload(sender_address, tx))
                    .on('transactionHash', (hash: string) => {
                        txHash = hash
                    })
                    .on('receipt', () => {
                        resolve({
                            erc20_approve_transaction_hash: txHash,
                            erc20_approve_value: amount,
                        })
                    })
                    .on('error', (error: Error) => reject(error))
            },
        )
    },
}
