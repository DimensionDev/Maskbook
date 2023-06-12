import type { ReactNode } from 'react'
import type { SecurityAPI } from '../entry-types.js'

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

export type SecurityKey =
    | 'security_info_code_not_verify_title'
    | 'security_info_code_not_verify_message'
    | 'security_info_functions_that_can_suspend_trading_title'
    | 'security_info_functions_that_can_suspend_trading_message'
    | 'default_placeholder'
    | 'not_found_tip_title'
    | 'not_found_tip_network_error'
    | 'not_found_tip_network_chain_correct'
    | 'not_found_tip_network_address_not_cover'
    | 'risk_safe_description'
    | 'risk_contract_source_code_verified_title'
    | 'risk_contract_source_code_verified_body'
    | 'risk_contract_source_code_not_verified_title'
    | 'risk_contract_source_code_not_verified_body'
    | 'risk_proxy_contract_title'
    | 'risk_proxy_contract_body'
    | 'risk_no_proxy_title'
    | 'risk_no_proxy_body'
    | 'risk_mint_function_title'
    | 'risk_mint_function_body'
    | 'risk_no_mint_function_title'
    | 'risk_no_mint_function_body'
    | 'risk_can_take_back_ownership_title'
    | 'risk_can_take_back_ownership_body'
    | 'risk_no_can_take_back_ownership_title'
    | 'risk_no_can_take_back_ownership_body'
    | 'risk_owner_change_balance_title'
    | 'risk_owner_change_balance_body'
    | 'risk_owner_can_not_change_balance_title'
    | 'risk_owner_can_not_change_balance_body'
    | 'risk_buy_tax_title'
    | 'risk_buy_tax_body'
    | 'risk_sell_tax_title'
    | 'risk_sell_tax_body'
    | 'risk_is_honeypot_title'
    | 'risk_is_honeypot_body'
    | 'risk_is_not_honeypot_title'
    | 'risk_is_not_honeypot_body'
    | 'risk_transfer_pausable_title'
    | 'risk_transfer_pausable_body'
    | 'risk_no_code_transfer_pausable_title'
    | 'risk_no_code_transfer_pausable_body'
    | 'risk_is_anti_whale_title'
    | 'risk_is_anti_whale_body'
    | 'risk_is_no_anti_whale_title'
    | 'risk_is_no_anti_whale_body'
    | 'risk_slippage_modifiable_title'
    | 'risk_slippage_modifiable_body'
    | 'risk_not_slippage_modifiable_title'
    | 'risk_not_slippage_modifiable_body'
    | 'risk_is_blacklisted_title'
    | 'risk_is_blacklisted_body'
    | 'risk_not_is_blacklisted_title'
    | 'risk_not_is_blacklisted_body'
    | 'risk_is_whitelisted_title'
    | 'risk_is_whitelisted_body'
    | 'risk_not_is_whitelisted_title'
    | 'risk_not_is_whitelisted_body'
    | 'risk_is_true_token_title'
    | 'risk_is_true_token_body'
    | 'risk_not_is_true_token_title'
    | 'risk_not_is_true_token_body'
    | 'risk_is_airdrop_scam_title'
    | 'risk_is_airdrop_scam_body'
    | 'risk_not_is_airdrop_scam_title'
    | 'risk_not_is_airdrop_scam_body'
    | 'contract_not_found'

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
    titleKey: SecurityKey
    messageKey: SecurityKey
    i18nParams?: (info: SecurityAPI.TokenSecurityType) => {
        [key in I18nOptions]: string
    }
    shouldHide(info: SecurityAPI.TokenSecurityType): boolean
}
