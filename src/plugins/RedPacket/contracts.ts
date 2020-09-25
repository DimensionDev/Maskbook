import * as jwt from 'jsonwebtoken'
import type { AbiItem } from 'web3-utils'
import { BigNumber } from 'bignumber.js'
import { web3 } from '../Wallet/web3'
import { getRedPacketByID, onClaimResult, onCreationResult, onExpired, onRefundResult } from './state-machine'
import HappyRedPacketABI from '../../contracts/happy-red-packet/HappyRedPacket.json'
import type { HappyRedPacket } from '../../contracts/happy-red-packet/HappyRedPacket'
import type { CheckRedPacketAvailabilityResult, CreateRedPacketResult, RedPacketJSONPayload } from './types'
import { asyncTimes, pollingTask } from '../../utils/utils'
import { sendTx } from '../Wallet/transaction'
import type { TxHashID, DatabaseID } from '../Wallet/api'
import { getChainId } from '../../extension/background-script/EthereumService'
import { EthereumTokenType } from '../../web3/types'
import { resolveChainName } from '../../web3/pipes'
import { getConstant } from '../../web3/helpers'
import { RED_PACKET_CONSTANTS } from './constants'
import { getWallets } from '../Wallet/wallet'

export type RedPacketID = { redPacketID: string }
function createRedPacketContract(address: string) {
    return (new web3.eth.Contract(HappyRedPacketABI as AbiItem[], address) as unknown) as HappyRedPacket
}
async function getRedPacketContract() {
    return createRedPacketContract(getConstant(RED_PACKET_CONSTANTS, 'HAPPY_RED_PACKET_ADDRESS', await getChainId()))
}
export const RedPacketAPI = {
    async claimByServer(
        claimWithWallet: string,
        payload: RedPacketJSONPayload,
    ): Promise<{ claim_transaction_hash: string }> {
        const host = 'https://redpacket.gives'
        const x = 'a3323cd1-fa42-44cd-b053-e474365ab3da'

        const network = resolveChainName(await getChainId()).toLowerCase()
        const auth = await fetch(`${host}/hi?id=${claimWithWallet}&network=${network}`)
        if (!auth.ok) throw new Error('Auth failed')
        const verify = await auth.text()

        const jwt_encoded: {
            password: string
            recipient: string
            redpacket_id: string
            validation: string
            signature: string
        } = {
            password: payload.password,
            recipient: claimWithWallet,
            redpacket_id: payload.rpid,
            validation: web3.utils.sha3(claimWithWallet)!,
            // TODO: This is not working on MetaMask cause it require the private key.
            signature: await web3.eth.sign(verify, claimWithWallet),
        }
        const pay = await fetch(
            `${host}/please?payload=${jwt.sign(jwt_encoded, x, { algorithm: 'HS256' })}&network=${network}`,
        )
        if (!pay.ok) throw new Error('Pay failed')
        return { claim_transaction_hash: await pay.text() }
    },
    /**
     *
     * @param hash_of_password Password
     * @param quantity Quantity of red packets
     * @param is_random Is the random valid
     * @param duration Red packet valid duration (default(0): 24h), unit: second
     * @param seed Random seed 32bit byte
     * @param message Message in the red packet
     * @param name Name of the red packet sender
     * @param token_type 0 - ETH, 1 - ERC20
     * @param token_addr Addr of ERC20 token
     * @param total_tokens Amount of tokens
     * @returns The transaction hash
     */
    async create(
        ____sender__addr: string,
        hash_of_password: string,
        quantity: number,
        isRandom: boolean,
        duration: number,
        seed: string,
        message: string,
        name: string,
        token_type: EthereumTokenType,
        token_addr: string,
        total_tokens: BigNumber,
        receipt = false,
    ): Promise<CreateRedPacketResult> {
        const contract = await getRedPacketContract()
        return new Promise((resolve, reject) => {
            let txHash = ''
            sendTx(
                contract.methods.create_red_packet(
                    hash_of_password,
                    quantity,
                    isRandom,
                    duration,
                    seed,
                    message,
                    name,
                    token_type,
                    token_addr,
                    total_tokens.toFixed(),
                ),
                {
                    from: ____sender__addr,
                    to: contract.options.address,
                    value: token_type === EthereumTokenType.Ether ? total_tokens.toFixed() : undefined,
                },
                {
                    onTransactionHash(hash) {
                        txHash = hash
                    },
                    async onReceipt() {
                        if (receipt) {
                            resolve({
                                create_nonce: (await web3.eth.getTransaction(txHash)).nonce,
                                create_transaction_hash: txHash,
                            })
                        }
                    },
                    async onConfirmation() {
                        resolve({
                            create_nonce: (await web3.eth.getTransaction(txHash)).nonce,
                            create_transaction_hash: txHash,
                        })
                    },
                    onTransactionError: reject,
                    onEstimateError: reject,
                },
            )
        })
    },
    /**
     * Claim a red packet
     * @param id Red packet ID
     * @param password Password, index from check_availability
     * @param recipient address of the receiver
     * @param validation hash of the request sender
     * @returns Claimed money
     */
    async claim(
        id: RedPacketID,
        password: string,
        recipient: string,
        validation: string,
        receipt = false,
    ): Promise<{ claim_transaction_hash: string }> {
        const contract = await getRedPacketContract()
        return new Promise((resolve, reject) => {
            let txHash = ''
            sendTx(
                contract.methods.claim(id.redPacketID, password, recipient, validation),
                {
                    from: recipient,
                    to: contract.options.address,
                },
                {
                    onTransactionHash(hash) {
                        txHash = hash
                    },
                    onReceipt() {
                        if (receipt) {
                            resolve({
                                claim_transaction_hash: txHash,
                            })
                        }
                    },
                    onConfirmation() {
                        resolve({
                            claim_transaction_hash: txHash,
                        })
                    },
                    onTransactionError: reject,
                    onEstimateError: reject,
                },
            )
        })
    },
    /**
     * Refund transaction hash
     * @param red_packet_id Red packet ID
     */
    async refund(id: RedPacketID, receipt = false): Promise<{ refund_transaction_hash: string }> {
        const packet = await getRedPacketByID(id.redPacketID)
        const wallets = await getWallets()

        if (!packet) throw new Error(`can not find red packet with id: ${id}`)
        if (wallets.every((wallet) => wallet.address !== packet.sender_address))
            throw new Error('can not find available wallet')

        const contract = await getRedPacketContract()

        return new Promise((resolve, reject) => {
            let txHash = ''
            sendTx(
                contract.methods.refund(id.redPacketID),
                {
                    from: packet!.sender_address,
                    to: contract.options.address,
                },
                {
                    onTransactionHash(hash: string) {
                        txHash = hash
                    },
                    onReceipt() {
                        if (receipt) {
                            resolve({
                                refund_transaction_hash: txHash,
                            })
                        }
                    },
                    onConfirmation() {
                        resolve({
                            refund_transaction_hash: txHash,
                        })
                    },
                    onTransactionError: reject,
                    onEstimateError: reject,
                },
            )
        })
    },
    /**
     * Check claimed address list
     * @param id Red packet ID
     */
    async checkClaimedList(id: RedPacketID): Promise<string[]> {
        return (await getRedPacketContract()).methods.check_claimed_list(id.redPacketID).call()
    },
    async watchClaimResult(id: TxHashID & DatabaseID) {
        const contract = await getRedPacketContract()
        asyncTimes(10, async () => {
            const { blockNumber } = await web3.eth.getTransaction(id.transactionHash)
            if (!blockNumber) return

            const evs = await contract.getPastEvents('ClaimSuccess', {
                fromBlock: blockNumber,
                toBlock: blockNumber,
            })
            const claimSuccessEv = evs.find((ev) => ev.transactionHash === id.transactionHash)

            if (claimSuccessEv) {
                const { id: return_id, claimer, claimed_value } = claimSuccessEv.returnValues as {
                    id: string
                    claimer: string
                    claimed_value: string
                    token_address: string
                }
                onClaimResult(id, {
                    type: 'success',
                    claimed_value: new BigNumber(claimed_value),
                    claimer,
                    red_packet_id: return_id,
                })
                return true
            }
            return
        })
            .then((results) => {
                if (!results.some((r) => r)) {
                    onClaimResult(id, {
                        type: 'failed',
                        reason: 'timeout',
                    })
                }
            })
            .catch((e) => {
                onClaimResult(id, {
                    type: 'failed',
                    reason: e.message,
                })
            })
    },
    async watchCreateResult(id: TxHashID & DatabaseID) {
        const contract = await getRedPacketContract()
        asyncTimes(10, async () => {
            const { blockNumber } = await web3.eth.getTransaction(id.transactionHash)
            if (!blockNumber) return

            const evs = await contract.getPastEvents('CreationSuccess', {
                fromBlock: blockNumber,
                toBlock: blockNumber,
            })
            const creationSuccessEv = evs.find((ev) => ev.transactionHash === id.transactionHash)

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
                    total: new BigNumber(total),
                })
                return true
            }
            return
        })
            .then((results) => {
                if (!results.some((r) => r)) {
                    onCreationResult(id, {
                        type: 'failed',
                        reason: 'timeout',
                    })
                }
            })
            .catch((e) => {
                onCreationResult(id, {
                    type: 'failed',
                    reason: e.message,
                })
            })
    },
    async watchExpired(id: RedPacketID) {
        pollingTask(async () => {
            const { expired } = await this.checkAvailability(id)

            if (expired) {
                onExpired(id)
                return true
            }
            return false
        })
    },
    async checkAvailability(id: RedPacketID): Promise<CheckRedPacketAvailabilityResult> {
        const contract = await getRedPacketContract()
        const {
            balance,
            claimed,
            expired,
            token_address,
            total,
            ifclaimed,
        } = await contract.methods.check_availability(id.redPacketID).call()
        return {
            balance: new BigNumber(balance),
            claimedCount: parseInt(claimed, 10),
            expired,
            token_address,
            totalCount: parseInt(total, 10),
            is_claimed: ifclaimed,
        }
    },
    async watchRefundResult(id: TxHashID & DatabaseID) {
        const contract = await getRedPacketContract()
        asyncTimes(10, async () => {
            const { blockNumber } = await web3.eth.getTransaction(id.transactionHash)
            if (!blockNumber) return

            const evs = await contract.getPastEvents('RefundSuccess', {
                fromBlock: blockNumber,
                toBlock: blockNumber,
            })
            const refundSuccessEv = evs.find((ev) => ev.transactionHash === id.transactionHash)

            if (refundSuccessEv) {
                const { id, remaining_balance } = refundSuccessEv.returnValues as {
                    id: string
                    token_address: string
                    remaining_balance: string
                }

                onRefundResult(
                    {
                        redPacketID: id,
                    },
                    {
                        remaining_balance: new BigNumber(remaining_balance),
                    },
                )
            }
        })
    },
}
