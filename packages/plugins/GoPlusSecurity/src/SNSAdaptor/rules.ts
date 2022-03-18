import { SecurityMessageLevel, TokenSecurity } from './components/Common'
import type { useI18N } from '../locales'
import parseInt from 'lodash-es/parseInt'

export interface SecurityMessage {
    type: 'contract-security' | 'transaction-security'
    level: SecurityMessageLevel
    condition(info: TokenSecurity): boolean
    titleKey: keyof ReturnType<typeof useI18N>
    messageKey: keyof ReturnType<typeof useI18N>
}

const percentageToNumber = (value: string) => parseInt(value.replace('%', ''))

export const SecurityMessages: SecurityMessage[] = [
    // open source
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.is_open_source === 1,
        titleKey: 'security_info_code_not_verify_title',
        messageKey: 'security_info_code_not_verify_message',
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.is_proxy === 0,
        titleKey: 'security_info_code_not_verify_title',
        messageKey: 'security_info_code_not_verify_message',
    },
    // proxy
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.is_proxy === 1,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.is_proxy === 0,
        titleKey: 'security_info_code_not_verify_title',
        messageKey: 'security_info_code_not_verify_message',
    },
    // mint
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.is_mintable === 0,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.is_mintable === 1,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
    // owner change balance
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.owner_change_balance === 0,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.owner_change_balance === 1,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
    // can take back ownership
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.can_take_back_ownership === 0,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.can_take_back_ownership === 1,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
    // buy tax
    {
        type: 'transaction-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => percentageToNumber(info.buy_tax) < 10,
        titleKey: 'security_info_code_not_verify_title',
        messageKey: 'security_info_code_not_verify_message',
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) =>
            percentageToNumber(info.buy_tax) >= 10 && percentageToNumber(info.buy_tax) < 50,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.High,
        condition: (info: TokenSecurity) =>
            percentageToNumber(info.buy_tax) >= 10 && percentageToNumber(info.buy_tax) >= 50,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
    // sell tax
    {
        type: 'transaction-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => percentageToNumber(info.sell_tax) < 10,
        titleKey: 'security_info_code_not_verify_title',
        messageKey: 'security_info_code_not_verify_message',
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) =>
            percentageToNumber(info.buy_tax) >= 10 && percentageToNumber(info.sell_tax) < 50,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.High,
        condition: (info: TokenSecurity) =>
            percentageToNumber(info.buy_tax) >= 10 && percentageToNumber(info.sell_tax) >= 50,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
    // honeypot
    {
        type: 'transaction-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.is_honeypot === 0,
        titleKey: 'security_info_code_not_verify_title',
        messageKey: 'security_info_code_not_verify_message',
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.High,
        condition: (info: TokenSecurity) => info.is_honeypot === 1,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
    // honeypot
    {
        type: 'transaction-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.transfer_pausable === 0,
        titleKey: 'security_info_code_not_verify_title',
        messageKey: 'security_info_code_not_verify_message',
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.transfer_pausable === 1,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
    // anti whale
    {
        type: 'transaction-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.is_anti_whale === 0,
        titleKey: 'security_info_code_not_verify_title',
        messageKey: 'security_info_code_not_verify_message',
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.is_anti_whale === 1,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
    // slippage modifiable
    {
        type: 'transaction-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.slippage_modifiable === 0,
        titleKey: 'security_info_code_not_verify_title',
        messageKey: 'security_info_code_not_verify_message',
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.slippage_modifiable === 1,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
    // black list
    {
        type: 'transaction-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.is_blacklisted === 0,
        titleKey: 'security_info_code_not_verify_title',
        messageKey: 'security_info_code_not_verify_message',
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.is_blacklisted === 1,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
    // white list
    {
        type: 'transaction-security',
        level: SecurityMessageLevel.Safe,
        condition: (info: TokenSecurity) => info.is_whitelisted === 0,
        titleKey: 'security_info_code_not_verify_title',
        messageKey: 'security_info_code_not_verify_message',
    },
    {
        type: 'contract-security',
        level: SecurityMessageLevel.Medium,
        condition: (info: TokenSecurity) => info.is_whitelisted === 1,
        titleKey: 'security_info_functions_that_can_suspend_trading_title',
        messageKey: 'security_info_functions_that_can_suspend_trading_message',
    },
]
