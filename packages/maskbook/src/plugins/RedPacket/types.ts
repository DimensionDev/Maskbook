import type { ERC20TokenRecord } from '../Wallet/database/types'
import type { EthereumTokenType, EthereumNetwork } from '../../web3/types'
import type { Transaction } from 'web3-core'

/**
 * @see https://github.com/DimensionDev/Tessercube-iOS/wiki/Red-Packet-Data-Dictionary
 */

export interface RedPacketRecord {
    /** The red packet ID */
    id: string
    /** From url */
    from: string
    /** The JSON payload */
    payload: RedPacketJSONPayload
}

export interface RedPacketRecordInDatabase extends RedPacketRecord {
    /** An unique record type in DB */
    type: 'red-packet'
}

export enum RedPacketStatus {
    claimed = 'claimed',
    expired = 'expired',
    empty = 'empty',
    refunded = 'refunded',
}

export interface RedPacketAvailability {
    token_address: string
    balance: string
    total: string
    claimed: string
    expired: boolean
    ifclaimed: boolean
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
    token_type: EthereumTokenType.Ether | EthereumTokenType.ERC20
    token?: Pick<ERC20TokenRecord, 'address' | 'name' | 'decimals' | 'symbol'>
}

export namespace History {
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
        $name: 'CreationSuccess'
        total: string
        id: string
        creator: string
        creation_time: string
        token_address: string
    }

    export interface ClaimInputLog {
        $name: 'claim'
        id: string
        password: string
        _recipient: string
        validation: string
    }

    export interface ClaimOutputLog {
        $name: 'ClaimSuccess'
        id: string
        claimer: string
        claimed_value: string
        token_address: string
    }

    export interface RefundInputLog {
        $name: 'refund'
        id: string
    }

    export interface RefundOutputLog {
        $name: 'RefundSuccess'
        id: string
        token_address: string
        remaining_balance: string
    }

    export type Log =
        | CreateInputLog
        | CreateOutputLog
        | ClaimInputLog
        | ClaimOutputLog
        | RefundInputLog
        | RefundOutputLog

    export interface RedPacketRecord {
        id: string
        status: 'refunded' | 'expired' | 'claimed' | 'empty' | null
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
            transaction: Transaction
            records: Log[]
        }[]
    }
}
