import { RedPacketTokenType } from '../../database/Plugins/Wallet/types'

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

export interface RedPacketAPI {
    dataSource: 'real' | 'mock'
    watchCreateResult(transaction: string): void
    watchClaimResult(transaction: string): void
    watchExpired(red_packet_id: string): void
    watchRefundResult(transaction: string): void
    /**
     *
     * @param hashes_of_password Passwords
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
        hashes_of_password: string[],
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
    checkAvailability(id: string): Promise<CheckRedPacketAvailabilityResult>
    /**
     * Claim a red packet
     * @param id Red packet ID
     * @param password Password, index from check_availability
     * @param recipient address of the receiver
     * @param validation hash of the request sender
     * @returns Claimed money
     */
    claim(id: string, password: string, recipient: string, validation: string): Promise<bigint>
    /**
     * Refund transaction hash
     * @param id Red packet ID
     */
    refund(id: string): Promise<{ refund_transaction_hash: string }>
    /**
     * Check who has claimed the red packet.
     * @returns A Map<wallet_address, claimed_amount>
     */
    checkClaimedList(id: string): Promise<Map<string, bigint>>
}

export interface WalletAPI {
    dataSource: 'real' | 'mock'
    watchWalletBalance(address: string): void
    approveERC20Token(
        erc20TokenAddress: string,
        amount: bigint,
    ): Promise<{ erc20_approve_transaction_hash: string; erc20_approve_value: bigint }>
}
