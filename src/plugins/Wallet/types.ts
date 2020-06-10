import type { BigNumber } from 'bignumber.js'

export type RedPacketCreationResult =
    | {
          type: 'success'
          block_creation_time: Date
          red_packet_id: string
          total: BigNumber
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
          claimed_value: BigNumber
      }
    | { type: 'failed'; reason?: string }

export interface CheckRedPacketAvailabilityResult {
    token_address: string
    balance: BigNumber
    totalCount: number
    claimedCount: number
    expired: boolean
    is_claimed: boolean
}

export interface CreateRedPacketResult {
    /** The transaction hash */
    create_transaction_hash: string
    create_nonce: number
}

export interface DonateResult {
    donate_transaction_hash: string
    donate_nonce: number
}
