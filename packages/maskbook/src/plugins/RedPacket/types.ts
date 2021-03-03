import type { ERC20TokenRecord } from '../Wallet/database/types'
import type { EthereumTokenType, NativeTokenDetailed, ERC20TokenDetailed, ChainId } from '@dimensiondev/web3-shared'

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

export enum DialogTabs {
    create = 0,
    past = 1,
}

export interface RedPacketAvailability {
    token_address: string
    balance: string
    total: string
    claimed: string
    expired: boolean
    claimed_amount: string
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
    network?: string
    token_type: EthereumTokenType.Native | EthereumTokenType.ERC20
    token?: Pick<ERC20TokenRecord, 'address' | 'name' | 'decimals' | 'symbol'>
}

export interface RedPacketRecordWithHistory {
    history: RedPacketHistoryInMask
    record: RedPacketRecord
}

//#region TokenOutMask
export type TokenOutMask = Omit<NativeTokenDetailed | ERC20TokenDetailed, 'chainId'> & {
    chain_id: ChainId
}
//#endregion

export interface RedPacketHistoryInMask {
    rpid: string
    contract_address: string
    password: string
    shares: number
    message: string
    name: string
    is_random: boolean
    total: string
    total_remaining: string
    creation_time: number
    last_updated_time: number
    duration: number
    chain_id: number
    token: NativeTokenDetailed | ERC20TokenDetailed
    creator: {
        name: string
        is_random: boolean
        total: string
        total_remaining: string
        creation_time: number
        last_updated_time: number
        duration: number
        chain_id: number
        token: NativeTokenDetailed | ERC20TokenDetailed
        creator: {
            name: string
            address: string
        }
        claimers: {
            name: string
            address: string
        }[]
        address: string
    }
    claimers: {
        name: string
        address: string
    }[]
}

export interface RedPacketHistoryOutMask extends Omit<RedPacketHistoryInMask, 'token'> {
    token: TokenOutMask
}
