import type { JSX, ReactNode } from 'react'
import type { SecurityAPI } from '../entry-types.js'
import type { MessageDescriptor } from '@lingui/core'

export interface GoPlusSpender {
    approved_contract: string
    approved_amount: string
    approved_for_all: 0 | 1
    address_info: {
        contract_name: string
        is_contract: -1 | 1
        is_open_source: -1 | 1
        tag: string
    }
}

export interface GoPlusTokenInfo {
    token_address: string
    token_name: string
    token_symbol: string
    chain_id: string
    balance: string
    approved_list: GoPlusSpender[]
}

export interface GoPlusTokenSpender {
    name: string
    address: string
    amount: number
    logo?: JSX.Element
    isMaskDapp: boolean
    tokenInfo: {
        address: string
        symbol: string
        name: string
    }
}

export interface GoPlusNFTInfo {
    chain_id: string
    nft_name: string
    nft_symbol: string
    nft_address: string
    approved_list: GoPlusSpender[]
}

export interface NFTSpenderInfo {
    isMaskDapp: boolean
    address: string
    amount: string
    name: string
    logo: ReactNode | undefined
    contract: {
        address: string
        name: string
    }
}

export enum SecurityMessageLevel {
    High = 'High',
    Medium = 'Medium',
    Safe = 'Safe',
}

export type I18nOptions = 'rate' | 'quantity'

export enum SecurityType {
    Contract = 'contract-security',
    Transaction = 'transaction-security',
    Info = 'info-security',
}

export interface SecurityMessage {
    type: SecurityType
    level: SecurityMessageLevel
    condition(info: SecurityAPI.TokenSecurityType): boolean
    title: MessageDescriptor | ((info: SecurityAPI.TokenSecurityType) => MessageDescriptor)
    message: MessageDescriptor
    shouldHide(info: SecurityAPI.TokenSecurityType): boolean
}
