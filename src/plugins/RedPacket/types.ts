import type { BigNumber } from 'bignumber.js'
import type { ERC20TokenRecord } from '../Wallet/database/types'
import type { EthereumTokenType, EthereumNetwork, Token, ChainId } from '../../web3/types'
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

/**
 * @see https://github.com/DimensionDev/Tessercube-iOS/wiki/Red-Packet-Data-Dictionary
 */

export interface RedPacketRecord {
    status: RedPacketStatus
    /** password that used to receive the red packet */
    password: string
    /** true if 'Random Mode'. false if 'Average Mode' */
    is_random: boolean
    /** Available time after block_creation_time. In seconds. Default 86400 (24hrs) */
    duration: number
    /** Read from create transaction result */
    red_packet_id?: string
    /** Red packet sender address */
    sender_address: string
    /** Trimmed not empty single line string. Max 30 chars */
    sender_name: string
    /** Red packet total value in Wei if ETH. In minimal unit if ERC20 token */
    send_total: string
    /** Trimmed single line string. Allow empty input. Max 140 chars. Replace inline break with space */
    send_message: string
    /** web3 network tag enum. Mainnet or Rinkeby */
    chainId: ChainId
    /** token type tag for red packet */
    token: Token
    /** Number of red packet shares */
    shares: string
    block_creation_time: string
    _found_in_url_: string
}
export interface RedPacketRecordInDatabase extends RedPacketRecord {}

export enum RedPacketStatus {
    initial = 'initial',
    claimed = 'claimed',
    expired = 'expired',
    empty = 'empty',
    refunded = 'refunded',
}

export interface RedPacketJSONPayload {
    contract_version: number
    contract_address: string
    rpid: string
    password: string
    shares: number
    sender: {
        address: string
        name: string
        message: string
    }
    is_random: boolean
    total: string
    creation_time: number
    duration: number
    network?: EthereumNetwork
    token_type: EthereumTokenType
    token?: Pick<ERC20TokenRecord, 'address' | 'name' | 'decimals' | 'symbol'>
}

export namespace History {
    export type RecordType = CreateRedPacketRecord

    export interface CreateInputLog {
        $name: 'create_red_packet'
        _hash: string
        _number: string
        _ifrandom: boolean
        _duration: string
        _seed: string
        _message: string
        _name: string
        _token_type: string
        _token_addr: string
        _total_tokens: string
    }

    export interface CreateOutputLog {
        $name: string
        total: string
        id: string
        creator: string
        creation_time: string
        token_address: string
    }

    export interface ClaimInputLog {
        $name: string
        id: string
        password: string
        _recipient: string
        validation: string
    }

    export interface ClaimOutputLog {
        $name: string
        id: string
        claimer: string
        claimed_value: string
        token_address: string
    }

    export interface RefundInputLog {
        $name: string
        id: string
    }

    export interface RefundOutputLog {
        $name: string
        id: string
        token_address: string
        remaining_balance: string
    }

    export interface CreateRedPacketRecord {
        id: string
        status: 'refunded' | 'expired' | 'claimed' | 'empty'
        availability: {
            balance: string
            claimed: boolean
            claimedCount: number
            expired: boolean
            tokenAddress: string
            totalCount: number
        }
        transactions: {
            timestamp: string
            records: (
                | CreateInputLog
                | CreateOutputLog
                | ClaimInputLog
                | ClaimOutputLog
                | RefundInputLog
                | RefundOutputLog
            )[]
        }[]
    }
}
