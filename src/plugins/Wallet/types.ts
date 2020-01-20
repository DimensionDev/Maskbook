import { RedPacketTokenType, EthereumNetwork } from '../../database/Plugins/Wallet/types'
import { ERC20TokenPredefinedData } from './erc20'

export type RedPacketCreationResult =
    | {
          type: 'success'
          block_creation_time: Date
          red_packet_id: string
          total: bigint
          creator: string
      }
    | { type: 'failed'; reason?: string }
export type RedPacketClaimResult =
    | {
          type: 'success'
          red_packet_id: string
          /** receiver's address */
          claimer: string
          /** claimed money amount */
          claimed_value: bigint
      }
    | { type: 'failed'; reason?: string }
interface CreateRedPacketResult {
    /** The transaction hash */
    create_transaction_hash: string
    create_nonce: number
}

interface CheckRedPacketAvailabilityResult {
    token_address: string
    balance: bigint
    totalCount: number
    claimedCount: number
    expired: boolean
}

type TxHashID = { transactionHash: string }
type RedPacketID = { redPacketID: string }
type DatabaseID = { databaseID: string }

export interface RedPacketAPI {
    dataSource: 'real' | 'mock'
    watchCreateResult(id: TxHashID & DatabaseID): void
    watchClaimResult(id: TxHashID & DatabaseID): void
    watchExpired(id: RedPacketID): void
    watchRefundResult(id: TxHashID & DatabaseID): void
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
    create(
        ____sender___addr: string,
        hash_of_password: string,
        quantity: number,
        is_random: boolean,
        duration: number,
        seed: string,
        message: string,
        name: string,
        token_type: RedPacketTokenType,
        token_addr: string,
        total_tokens: bigint,
    ): Promise<CreateRedPacketResult>
    /**
     * Check if the card is availability
     * @param id Red packet ID
     */
    checkAvailability(id: RedPacketID): Promise<CheckRedPacketAvailabilityResult>
    /**
     * Claim a red packet
     * @param id Red packet ID
     * @param password Password, index from check_availability
     * @param recipient address of the receiver
     * @param validation hash of the request sender
     * @returns Claimed money
     */
    claim(
        id: RedPacketID,
        password: string,
        recipient: string,
        validation: string,
    ): Promise<{ claim_transaction_hash: string }>
    /**
     * Refund transaction hash
     * @param red_packet_id Red packet ID
     */
    refund(id: RedPacketID): Promise<{ refund_transaction_hash: string }>
}

export interface WalletAPI {
    dataSource: 'real' | 'mock'
    addWalletPrivateKey(wallet: string, key: string): void
    watchWalletBalance(address: string): void
    watchERC20TokenBalance(walletAddress: string, tokenAddress: string): void
    approveERC20Token(
        senderAddress: string,
        erc20TokenAddress: string,
        amount: bigint,
    ): Promise<{ erc20_approve_transaction_hash: string; erc20_approve_value: bigint }>
}
