import type { SecurityAPI } from '../entry-types.js'
import { type SecurityMessage, SecurityMessageLevel, SecurityType } from './types.js'

function percentageToNumber(value?: string) {
    const result =
        value?.endsWith('%') ? Number.parseFloat(value.replace('%', '')) : Number.parseFloat(value ?? '0') * 100

    return Number.isNaN(result) ? 0 : result
}
function isUnset(name: keyof SecurityAPI.TokenSecurityType) {
    return (info: SecurityAPI.TokenSecurityType) => info[name] === undefined
}

export const SecurityMessages: SecurityMessage[] = [
    // open source
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_open_source === '1',
        titleKey: 'risk_contract_source_code_verified_title',
        messageKey: 'risk_contract_source_code_verified_body',
        shouldHide: isUnset('is_open_source'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.High,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_open_source === '0',
        titleKey: 'risk_contract_source_code_not_verified_title',
        messageKey: 'risk_contract_source_code_not_verified_body',
        shouldHide: isUnset('is_open_source'),
    },
    // proxy
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_proxy === '1',
        titleKey: 'risk_proxy_contract_title',
        messageKey: 'risk_proxy_contract_body',
        shouldHide: isUnset('is_proxy'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_proxy === '0',
        titleKey: 'risk_no_proxy_title',
        messageKey: 'risk_no_proxy_body',
        shouldHide: isUnset('is_proxy'),
    },
    // mint
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_mintable === '0',
        titleKey: 'risk_no_mint_function_title',
        messageKey: 'risk_no_mint_function_body',
        shouldHide: isUnset('is_mintable'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_mintable === '1',
        titleKey: 'risk_mint_function_title',
        messageKey: 'risk_mint_function_body',
        shouldHide: isUnset('is_mintable'),
    },
    // owner change balance
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.owner_change_balance === '0',
        titleKey: 'risk_owner_can_not_change_balance_title',
        messageKey: 'risk_owner_can_not_change_balance_body',
        shouldHide: isUnset('owner_change_balance'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.owner_change_balance === '1',
        titleKey: 'risk_owner_change_balance_title',
        messageKey: 'risk_owner_change_balance_body',
        shouldHide: isUnset('owner_change_balance'),
    },
    // can take back ownership
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.can_take_back_ownership === '0',
        titleKey: 'risk_no_can_take_back_ownership_title',
        messageKey: 'risk_no_can_take_back_ownership_body',
        shouldHide: isUnset('can_take_back_ownership'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.can_take_back_ownership === '1',
        titleKey: 'risk_can_take_back_ownership_title',
        messageKey: 'risk_can_take_back_ownership_body',
        shouldHide: isUnset('can_take_back_ownership'),
    },
    // buy tax
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => percentageToNumber(info.buy_tax) < 10,
        titleKey: 'risk_buy_tax_title',
        messageKey: 'risk_buy_tax_body',
        i18nParams: (info: SecurityAPI.TokenSecurityType) => ({
            rate: `${percentageToNumber(info.buy_tax)}%`,
            quantity: '',
        }),
        shouldHide: isUnset('buy_tax'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) =>
            percentageToNumber(info.buy_tax) >= 10 && percentageToNumber(info.buy_tax) < 50,
        titleKey: 'risk_buy_tax_title',
        messageKey: 'risk_buy_tax_body',
        i18nParams: (info: SecurityAPI.TokenSecurityType) => ({
            rate: `${percentageToNumber(info.buy_tax)}%`,
            quantity: '',
        }),
        shouldHide: isUnset('buy_tax'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.High,
        condition: (info: SecurityAPI.TokenSecurityType) => percentageToNumber(info.buy_tax) >= 50,
        titleKey: 'risk_buy_tax_title',
        messageKey: 'risk_buy_tax_body',
        i18nParams: (info: SecurityAPI.TokenSecurityType) => ({
            rate: `${percentageToNumber(info.buy_tax)}%`,
            quantity: '',
        }),
        shouldHide: isUnset('buy_tax'),
    },
    // sell tax
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => percentageToNumber(info.sell_tax) < 10,
        titleKey: 'risk_sell_tax_title',
        messageKey: 'risk_sell_tax_body',
        i18nParams: (info: SecurityAPI.TokenSecurityType) => ({
            rate: `${percentageToNumber(info.sell_tax)}%`,
            quantity: '',
        }),
        shouldHide: isUnset('sell_tax'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) =>
            percentageToNumber(info.sell_tax) >= 10 && percentageToNumber(info.sell_tax) < 50,
        titleKey: 'risk_sell_tax_title',
        messageKey: 'risk_sell_tax_body',
        i18nParams: (info: SecurityAPI.TokenSecurityType) => ({
            rate: `${percentageToNumber(info.sell_tax)}%`,
            quantity: '',
        }),
        shouldHide: isUnset('sell_tax'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.High,
        condition: (info: SecurityAPI.TokenSecurityType) => percentageToNumber(info.sell_tax) >= 50,
        titleKey: 'risk_sell_tax_title',
        messageKey: 'risk_sell_tax_body',
        i18nParams: (info: SecurityAPI.TokenSecurityType) => ({
            rate: `${percentageToNumber(info.sell_tax)}%`,
            quantity: '',
        }),
        shouldHide: isUnset('sell_tax'),
    },
    // honeypot
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_honeypot === '0',
        titleKey: 'risk_is_not_honeypot_title',
        messageKey: 'risk_is_not_honeypot_body',
        shouldHide: isUnset('is_honeypot'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.High,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_honeypot === '1',
        titleKey: 'risk_is_honeypot_title',
        messageKey: 'risk_is_honeypot_body',
        shouldHide: isUnset('is_honeypot'),
    },
    // transfer_pausable
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.transfer_pausable === '0',
        titleKey: 'risk_no_code_transfer_pausable_title',
        messageKey: 'risk_no_code_transfer_pausable_title',
        shouldHide: isUnset('transfer_pausable'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.transfer_pausable === '1',
        titleKey: 'risk_transfer_pausable_title',
        messageKey: 'risk_transfer_pausable_body',
        shouldHide: isUnset('transfer_pausable'),
    },
    // anti whale
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_anti_whale === '0',
        titleKey: 'risk_is_no_anti_whale_title',
        messageKey: 'risk_is_no_anti_whale_body',
        shouldHide: isUnset('is_anti_whale'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_anti_whale === '1',
        titleKey: 'risk_is_anti_whale_title',
        messageKey: 'risk_is_anti_whale_body',
        shouldHide: isUnset('is_anti_whale'),
    },
    // slippage modifiable
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.slippage_modifiable === '0',
        titleKey: 'risk_not_slippage_modifiable_title',
        messageKey: 'risk_not_slippage_modifiable_body',
        shouldHide: isUnset('slippage_modifiable'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.slippage_modifiable === '1',
        titleKey: 'risk_slippage_modifiable_title',
        messageKey: 'risk_slippage_modifiable_body',
        shouldHide: isUnset('slippage_modifiable'),
    },
    // black list
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_blacklisted === '0',
        titleKey: 'risk_not_is_blacklisted_title',
        messageKey: 'risk_not_is_blacklisted_body',
        shouldHide: isUnset('is_blacklisted'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_blacklisted === '1',
        titleKey: 'risk_is_blacklisted_title',
        messageKey: 'risk_is_blacklisted_body',
        shouldHide: isUnset('is_blacklisted'),
    },
    // white list
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_whitelisted === '0',
        titleKey: 'risk_not_is_whitelisted_title',
        messageKey: 'risk_not_is_whitelisted_body',
        shouldHide: isUnset('is_whitelisted'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_whitelisted === '1',
        titleKey: 'risk_is_whitelisted_title',
        messageKey: 'risk_is_whitelisted_body',
        shouldHide: isUnset('is_whitelisted'),
    },
    // true token
    {
        type: SecurityType.Info,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_true_token === '1',
        titleKey: 'risk_is_true_token_title',
        messageKey: 'risk_is_true_token_body',
        shouldHide: isUnset('is_true_token'),
    },
    {
        type: SecurityType.Info,
        level: SecurityMessageLevel.High,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_true_token === '0',
        titleKey: 'risk_not_is_true_token_title',
        messageKey: 'risk_not_is_true_token_body',
        shouldHide: isUnset('is_true_token'),
    },
    // Airdrop scam
    {
        type: SecurityType.Info,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_airdrop_scam === '0',
        titleKey: 'risk_is_airdrop_scam_title',
        messageKey: 'risk_is_airdrop_scam_body',
        shouldHide: isUnset('is_airdrop_scam'),
    },
    {
        type: SecurityType.Info,
        level: SecurityMessageLevel.High,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_airdrop_scam === '1',
        titleKey: 'risk_not_is_airdrop_scam_title',
        messageKey: 'risk_not_is_airdrop_scam_body',
        shouldHide: isUnset('is_airdrop_scam'),
    },
]
