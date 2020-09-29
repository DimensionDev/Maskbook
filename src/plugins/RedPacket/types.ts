import type { BigNumber } from 'bignumber.js'
import type { ERC20TokenRecord } from '../Wallet/database/types'
import type { EthereumTokenType, EthereumNetwork, Token, ChainId } from '../../web3/types'

/**
 * @see https://github.com/DimensionDev/Tessercube-iOS/wiki/Red-Packet-Data-Dictionary
 */

export interface RedPacketRecord {
    /** The red packet ID */
    rpid: string
    /** From url */
    from: string
    /** The JSON payload */
    payload: RedPacketJSONPayload
}

export interface RedPacketRecordInDatabase extends RedPacketRecord {}

export enum RedPacketStatus {
    initial = 'initial',
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
