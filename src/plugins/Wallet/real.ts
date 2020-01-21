import { AbiItem } from 'web3-utils'
import { EventData } from 'web3-eth-contract'
import { RedPacketAPI, WalletAPI } from './types'
import { onClaimResult, onCreationResult, onExpired, onRefundResult } from './red-packet-fsm'
import { onWalletBalanceUpdated, onWalletERC20TokenBalanceUpdated } from './wallet'
import { web3 } from './web3'
import HappyRedPacketABI from '../../contracts/HappyRedPacket.json'
import IERC20ABI from '../../contracts/IERC20.json'
import { HappyRedPacket } from '../../contracts/HappyRedPacket'
import { IERC20 } from '../../contracts/IERC20'
import { TransactionObject, Tx } from '../../contracts/types'
import { RedPacketTokenType } from '../../database/Plugins/Wallet/types'
import { asyncTimes, pollingTask } from '../../utils/utils'
import { createWalletDBAccess } from '../../database/Plugins/Wallet/Wallet.db'
import { createTransaction } from '../../database/helpers/openDB'

// TODO: should not be a constant. should respect the value in the red packet record
const RED_PACKET_CONTRACT_ADDRESS = '0xC21F17f4f2E04ae718f1e65a29C833627eaA0b6f'

function createRedPacketContract(address: string) {
    return (new web3.eth.Contract(HappyRedPacketABI as AbiItem[], address) as unknown) as HappyRedPacket
}

function createERC20Contract(address: string) {
    return (new web3.eth.Contract(IERC20ABI as AbiItem[], address) as unknown) as IERC20
}

interface TxReceipt {
    blockHash: string
    blockNumber: number
    transactionHash: string
    events: Record<string, EventData>
}

interface TxListeners {
    onTransactionHash?: (hash: string) => void
    onTransactionError?: (error: Error) => void
    onReceipt?: (receipt: TxReceipt) => void
    onEstimateError?: (error: Error) => void
}

async function sendTx<R, T extends TransactionObject<R>>(txObject: T, tx: Tx = {}, listeners: TxListeners = {}) {
    return Promise.all([txObject.estimateGas(tx), web3.eth.getGasPrice()])
        .then(([gas, gasPrice]) =>
            txObject
                .send({
                    ...tx,
                    gas,
                    gasPrice,
                })
                .on('transactionHash', (hash: string) => listeners?.onTransactionHash?.(hash))
                .on('receipt', (receipt: TxReceipt) => listeners?.onReceipt?.(receipt))
                .on('error', (err: Error) => listeners?.onTransactionError?.(err)),
        )
        .catch((err: Error) => listeners?.onEstimateError?.(err))
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

        return new Promise((resolve, reject) => {
            let txHash = ''

            sendTx(
                tx,
                {
                    from: ____sender__addr,
                    value: token_type === RedPacketTokenType.eth ? total_tokens.toString() : undefined,
                },
                {
                    onTransactionHash(hash) {
                        txHash = hash
                    },
                    async onReceipt() {
                        resolve({
                            create_nonce: (await web3.eth.getTransaction(txHash)).nonce,
                            create_transaction_hash: txHash,
                        })
                    },
                    onTransactionError(err) {
                        reject(err)
                    },
                    onEstimateError(err) {
                        reject(err)
                    },
                },
            )
        })
    },
    async claim(id, password: string, recipient: string, validation: string) {
        const contract = createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
        const tx = contract.methods.claim(id.redPacketID, password, recipient, validation)

        return new Promise((resolve, reject) => {
            let txHash = ''

            sendTx(
                tx,
                {
                    from: recipient,
                },
                {
                    onTransactionHash(hash) {
                        txHash = hash
                    },
                    onReceipt() {
                        resolve({
                            claim_transaction_hash: txHash,
                        })
                    },
                    onTransactionError(err) {
                        reject(err)
                    },
                    onEstimateError(err) {
                        reject(err)
                    },
                },
            )
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
        const {
            balance,
            claimed,
            expired,
            token_address,
            total,
            ifclaimed,
        } = await contract.methods.check_availability(id.redPacketID).call()

        return {
            balance: BigInt(balance),
            claimedCount: parseInt(claimed),
            expired,
            token_address,
            totalCount: parseInt(total),
            is_claimed: ifclaimed,
        }
    },
    async checkClaimedList(id) {
        return createRedPacketContract(RED_PACKET_CONTRACT_ADDRESS)
            .methods.check_claimed_list(id.redPacketID)
            .call()
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

        return new Promise((resolve, reject) => {
            let txHash = ''

            sendTx(
                tx,
                {
                    from: sender!.sender_address!,
                },
                {
                    onTransactionHash(hash: string) {
                        txHash = hash
                    },
                    onReceipt() {
                        resolve({
                            refund_transaction_hash: txHash,
                        })
                    },
                    onTransactionError(err) {
                        reject(err)
                    },
                    onEstimateError(err) {
                        reject(err)
                    },
                },
            )
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
    removeWalletPrivateKey(address: string, privateKey: string) {
        web3.eth.accounts.wallet.remove('0x' + privateKey)
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

        return new Promise((resolve, reject) => {
            let txHash = ''
            sendTx(
                tx,
                {
                    from: sender_address,
                },
                {
                    onTransactionHash(hash) {
                        txHash = hash
                    },
                    onReceipt() {
                        resolve({
                            erc20_approve_transaction_hash: txHash,
                            erc20_approve_value: amount,
                        })
                    },
                    onTransactionError(err) {
                        reject(err)
                    },
                    onEstimateError(err) {
                        reject(err)
                    },
                },
            )
        })
    },
}
