import type { ERC20TokenRecord } from '../Wallet/database/types'
import type { EthereumTokenType, EthereumNetwork } from '../../web3/types'
export interface ITORecord {
    id: string
    from: string
    payload: ITOJSONPayload
}

export interface ITORecordDatabase extends ITORecord {
    type: 'ito'
}

export enum ITOStatus {
    clained = 'claimed',
    expired = 'expired',
    empty = 'empty',
    refunded = 'refunded',
}

export interface ITOMetaData {
    data: string
    sender?: string
}

export interface ITOAvailability {
    token_address: string
    balance: string
    tottal: String
    claimed: string
    expired: boolean
    ifclaimed: boolean
}

export interface ITOJSONPayload {
    contract_version: number
    contract_address: string
    rpid: string

    password: string
    sender: {
        address: string
        name: string
        message: string
    }
    total: string
    create_time: number
    duraction: number
    network?: EthereumNetwork
    from_token_type: EthereumTokenType.Ether | EthereumTokenType.ERC20
    from_token?: Pick<ERC20TokenRecord, 'address' | 'name' | 'decimals' | 'symbol'>
    to_token_type: EthereumTokenType.Ether | EthereumTokenType.ERC20
    to_token?: Pick<ERC20TokenRecord, 'address' | 'name' | 'decimals' | 'symbol'>
    num: number
    enddate: string
    ratio: number
}
