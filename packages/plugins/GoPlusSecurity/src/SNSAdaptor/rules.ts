import { SecurityMessageLevel, TokenSecurity } from './components/Common'
import type { useI18N } from '../locales'
import parseInt from 'lodash-es/parseInt'

export interface SecurityMessage {
    type: 'contract-security' | 'transaction-security'
    level: SecurityMessageLevel
    condition(info: TokenSecurity): boolean
    titleKey: keyof ReturnType<typeof useI18N>
    messageKey: keyof ReturnType<typeof useI18N>
    shouldHide(info: TokenSecurity): boolean
}

const percentageToNumber = (value?: string) => parseInt((value ?? '').replace('%', ''))

export const SecurityMessages: SecurityMessage[] = [
    // open source
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.is_open_source === '1',
        titleKey: 'risk_contract_source_code_verified_title',
        messageKey: 'risk_contract_source_code_verified_body',
        shouldHide: (info: TokenSecurity) => info.is_open_source === undefined,
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.High,
        condition: (info: TokenSecurity) => info.is_open_source === '0',
        titleKey: 'risk_contract_source_code_not_verified_title',
        messageKey: 'risk_contract_source_code_not_verified_body',
        shouldHide: (info: TokenSecurity) => info.is_open_source === undefined,
    },
    // proxy
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.is_proxy === '1',
        titleKey: 'risk_proxy_contract_title',
        messageKey: 'risk_proxy_contract_body',
        shouldHide: (info: TokenSecurity) => info.is_proxy === undefined,
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.is_proxy === '0',
        titleKey: 'risk_no_proxy_title',
        messageKey: 'risk_no_proxy_body',
        shouldHide: (info: TokenSecurity) => info.is_proxy === undefined,
    },
    // mint
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.is_mintable === '0',
        titleKey: 'risk_no_mint_function_title',
        messageKey: 'risk_no_mint_function_body',
        shouldHide: (info: TokenSecurity) => info.is_mintable === undefined,
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.is_mintable === '1',
        titleKey: 'risk_mint_function_title',
        messageKey: 'risk_mint_function_body',
        shouldHide: (info: TokenSecurity) => info.is_mintable === undefined,
    },
    // owner change balance
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.owner_change_balance === '0',
        titleKey: 'risk_owner_can_not_change_balance_title',
        messageKey: 'risk_owner_can_not_change_balance_body',
        shouldHide: (info: TokenSecurity) => info.owner_change_balance === undefined,
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.owner_change_balance === '1',
        titleKey: 'risk_owner_change_balance_title',
        messageKey: 'risk_owner_change_balance_body',
        shouldHide: (info: TokenSecurity) => info.owner_change_balance === undefined,
    },
    // can take back ownership
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.can_take_back_ownership === '0',
        titleKey: 'risk_no_can_take_back_ownership_title',
        messageKey: 'risk_no_can_take_back_ownership_body',
        shouldHide: (info: TokenSecurity) => info.can_take_back_ownership === undefined,
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.can_take_back_ownership === '1',
        titleKey: 'risk_can_take_back_ownership_title',
        messageKey: 'risk_can_take_back_ownership_body',
        shouldHide: (info: TokenSecurity) => info.can_take_back_ownership === undefined,
    },
    // buy tax
    {
        type: 'transaction-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => percentageToNumber(info.buy_tax) < 10,
        titleKey: 'risk_buy_tax_title',
        messageKey: 'risk_buy_tax_body',
        shouldHide: (info: TokenSecurity) => info.buy_tax === undefined,
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) =>
            percentageToNumber(info.buy_tax) >= 10 && percentageToNumber(info.buy_tax) < 50,
        titleKey: 'risk_buy_tax_title',
        messageKey: 'risk_buy_tax_body',
        shouldHide: (info: TokenSecurity) => info.buy_tax === undefined,
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.High,
        condition: (info: TokenSecurity) =>
            percentageToNumber(info.buy_tax) >= 10 && percentageToNumber(info.buy_tax) >= 50,
        titleKey: 'risk_buy_tax_title',
        messageKey: 'risk_buy_tax_body',
        shouldHide: (info: TokenSecurity) => info.buy_tax === undefined,
    },
    // sell tax
    {
        type: 'transaction-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => percentageToNumber(info.sell_tax) < 10,
        titleKey: 'risk_buy_tax_title',
        messageKey: 'risk_buy_tax_body',
        shouldHide: (info: TokenSecurity) => info.sell_tax === undefined,
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) =>
            percentageToNumber(info.buy_tax) >= 10 && percentageToNumber(info.sell_tax) < 50,
        titleKey: 'risk_buy_tax_title',
        messageKey: 'risk_buy_tax_body',
        shouldHide: (info: TokenSecurity) => info.sell_tax === undefined,
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.High,
        condition: (info: TokenSecurity) =>
            percentageToNumber(info.buy_tax) >= 10 && percentageToNumber(info.sell_tax) >= 50,
        titleKey: 'risk_buy_tax_title',
        messageKey: 'risk_buy_tax_body',
        shouldHide: (info: TokenSecurity) => info.sell_tax === undefined,
    },
    // honeypot
    {
        type: 'transaction-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.is_honeypot === '0',
        titleKey: 'risk_is_not_honeypot_title',
        messageKey: 'risk_is_not_honeypot_body',
        shouldHide: (info: TokenSecurity) => info.is_honeypot === undefined,
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.High,
        condition: (info: TokenSecurity) => info.is_honeypot === '1',
        titleKey: 'risk_is_honeypot_title',
        messageKey: 'risk_is_honeypot_body',
        shouldHide: (info: TokenSecurity) => info.is_honeypot === undefined,
    },
    // transfer_pausable
    {
        type: 'transaction-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.transfer_pausable === '0',
        titleKey: 'risk_no_code_transfer_pausable_title',
        messageKey: 'risk_no_code_transfer_pausable_title',
        shouldHide: (info: TokenSecurity) => info.transfer_pausable === undefined,
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.transfer_pausable === '1',
        titleKey: 'risk_transfer_pausable_title',
        messageKey: 'risk_transfer_pausable_body',
        shouldHide: (info: TokenSecurity) => info.transfer_pausable === undefined,
    },
    // anti whale
    {
        type: 'transaction-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.is_anti_whale === '0',
        titleKey: 'risk_is_no_anti_whale_title',
        messageKey: 'risk_is_no_anti_whale_body',
        shouldHide: (info: TokenSecurity) => info.is_anti_whale === undefined,
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.is_anti_whale === '1',
        titleKey: 'risk_is_anti_whale_title',
        messageKey: 'risk_is_anti_whale_body',
        shouldHide: (info: TokenSecurity) => info.is_anti_whale === undefined,
    },
    // slippage modifiable
    {
        type: 'transaction-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.slippage_modifiable === '0',
        titleKey: 'risk_not_slippage_modifiable_title',
        messageKey: 'risk_not_slippage_modifiable_body',
        shouldHide: (info: TokenSecurity) => info.slippage_modifiable === undefined,
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.slippage_modifiable === '1',
        titleKey: 'risk_slippage_modifiable_body',
        messageKey: 'risk_slippage_modifiable_title',
        shouldHide: (info: TokenSecurity) => info.slippage_modifiable === undefined,
    },
    // black list
    {
        type: 'transaction-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.is_blacklisted === '0',
        titleKey: 'risk_not_is_blacklisted_title',
        messageKey: 'risk_not_is_blacklisted_body',
        shouldHide: (info: TokenSecurity) => info.is_blacklisted === undefined,
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.is_blacklisted === '1',
        titleKey: 'risk_is_blacklisted_title',
        messageKey: 'risk_is_blacklisted_body',
        shouldHide: (info: TokenSecurity) => info.is_blacklisted === undefined,
    },
    // white list
    {
        type: 'transaction-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.is_whitelisted === '0',
        titleKey: 'risk_not_is_whitelisted_title',
        messageKey: 'risk_not_is_whitelisted_body',
        shouldHide: (info: TokenSecurity) => info.is_whitelisted === undefined,
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.is_whitelisted === '1',
        titleKey: 'risk_is_whitelisted_title',
        messageKey: 'risk_is_whitelisted_body',
        shouldHide: (info: TokenSecurity) => info.is_whitelisted === undefined,
    },
]
