import type { SecurityAPI } from '../entry-types.js'
import { type SecurityMessage, SecurityMessageLevel, SecurityType } from './types.js'
import { msg } from '@lingui/macro'

function percentageToNumber(value?: string) {
    const result =
        value?.endsWith('%') ? Number.parseFloat(value.replace('%', '')) : Number.parseFloat(value ?? '0') * 100

    return Number.isNaN(result) ? 0 : result
}
function isUnset(name: keyof SecurityAPI.TokenSecurityType) {
    return (info: SecurityAPI.TokenSecurityType) => info[name] === undefined
}

const sellTax = (info: SecurityAPI.TokenSecurityType) => msg`Sell Tax: ${percentageToNumber(info.sell_tax)}`
const buyTax = (info: SecurityAPI.TokenSecurityType) => msg`Buy Tax: ${percentageToNumber(info.sell_tax)}`

export const SecurityMessages: SecurityMessage[] = [
    // open source
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_open_source === '1',
        title: msg`Contract source code verified`,
        message: msg`This token contract has source code available. You can check the contract code to verify if it has malicious functions. Token contracts with no source code available are likely to be a fraud.`,
        shouldHide: isUnset('is_open_source'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.High,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_open_source === '0',
        title: msg`Contract source code not verified`,
        message: msg`This token contract has not been verified. We cannot check the contract code for details. Token contracts with no source code available are likely to be a fraud.`,
        shouldHide: isUnset('is_open_source'),
    },
    // proxy
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_proxy === '1',
        title: msg`Proxy contract`,
        message: msg`This contract is an Admin Upgradeable Proxy. A proxy contract means the contract owner can modify the function of the token and could possibly effect the price. It is possible for the team to rug or scam. Please confirm the details with the project team before investing.`,
        shouldHide: isUnset('is_proxy'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_proxy === '0',
        title: msg`No proxy`,
        message: msg`There is no proxy in the contract. A proxy contract means the contract owner can modify the function of the token and possibly effect the price.`,
        shouldHide: isUnset('is_proxy'),
    },
    // mint
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_mintable === '0',
        title: msg`No mint function`,
        message: msg`Mint function is transparent or non-existent. Hidden mint functions may increase the amount of tokens in circulation and effect the price of the token.`,
        shouldHide: isUnset('is_mintable'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_mintable === '1',
        title: msg`Mint function`,
        message: msg`The contract may contain additional issuance functions, which could maybe generate a large number of tokens, resulting in significant fluctuations in token prices. It is recommended to confirm with the project team whether it complies with the token issuance instructions.`,
        shouldHide: isUnset('is_mintable'),
    },
    // owner change balance
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.owner_change_balance === '0',
        title: msg`Owner can't change balance`,
        message: msg`The contract owner is not known to be able to modify the balance of the token of other addresses.`,
        shouldHide: isUnset('owner_change_balance'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.owner_change_balance === '1',
        title: msg`Owner can change balance`,
        message: msg`The contract owner is known to be able to modify the balance of the token of other addresses, which may result in a loss of assets.`,
        shouldHide: isUnset('owner_change_balance'),
    },
    // can take back ownership
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.can_take_back_ownership === '0',
        title: msg`No function found that retrieves ownership`,
        message: msg`If this kind of function exists, it is possible for the project owner to regain ownership even after relinquishing it.`,
        shouldHide: isUnset('can_take_back_ownership'),
    },
    {
        type: SecurityType.Contract,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.can_take_back_ownership === '1',
        title: msg`Functions with retrievable ownership`,
        message: msg`If this kind of function exists, it is possible for the project owner to regain ownership even after relinquishing it.`,
        shouldHide: isUnset('can_take_back_ownership'),
    },
    // buy tax
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => percentageToNumber(info.buy_tax) < 10,
        title: buyTax,
        message: msg`Above 10% may be considered a high tax rate. More than 50% tax rate means may not be tradable.`,
        shouldHide: isUnset('buy_tax'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) =>
            percentageToNumber(info.buy_tax) >= 10 && percentageToNumber(info.buy_tax) < 50,
        title: buyTax,
        message: msg`Above 10% may be considered a high tax rate. More than 50% tax rate means may not be tradable.`,
        shouldHide: isUnset('buy_tax'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.High,
        condition: (info: SecurityAPI.TokenSecurityType) => percentageToNumber(info.buy_tax) >= 50,
        title: buyTax,
        message: msg`Above 10% may be considered a high tax rate. More than 50% tax rate means may not be tradable.`,
        shouldHide: isUnset('buy_tax'),
    },
    // sell tax
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => percentageToNumber(info.sell_tax) < 10,
        title: sellTax,
        message: msg`Above 10% may be considered a high tax rate. More than 50% tax rate means may not be tradable.`,
        shouldHide: isUnset('sell_tax'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) =>
            percentageToNumber(info.sell_tax) >= 10 && percentageToNumber(info.sell_tax) < 50,
        title: sellTax,
        message: msg`Above 10% may be considered a high tax rate. More than 50% tax rate means may not be tradable.`,
        shouldHide: isUnset('sell_tax'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.High,
        condition: (info: SecurityAPI.TokenSecurityType) => percentageToNumber(info.sell_tax) >= 50,
        title: sellTax,
        message: msg`Above 10% may be considered a high tax rate. More than 50% tax rate means may not be tradable.`,
        shouldHide: isUnset('sell_tax'),
    },
    // honeypot
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_honeypot === '0',
        title: msg`Unlikely to be a honeypot.`,
        message: msg`We are not aware of any code that prevents the sale of tokens.`,
        shouldHide: isUnset('is_honeypot'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.High,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_honeypot === '1',
        title: msg`May be a honeypot.`,
        message: msg`This token contract has code that prevent selling. This might is a honeypot.`,
        shouldHide: isUnset('is_honeypot'),
    },
    // transfer_pausable
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.transfer_pausable === '0',
        title: msg`No codes found to suspend trading.`,
        message: msg`If this kind of code exists, the token maybe be frozen to buy or sell, which is a honeypot risk.`,
        shouldHide: isUnset('transfer_pausable'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.transfer_pausable === '1',
        title: msg`Functions that can suspend trading`,
        message: msg`If this kind of code exists, the token maybe be frozen to buy or sell, which is a honeypot risk.`,
        shouldHide: isUnset('transfer_pausable'),
    },
    // anti whale
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_anti_whale === '0',
        title: msg`No anti_whale(Unlimited number of transactions)`,
        message: msg`There is no up bound of token transactions. If this kind of limit exists, the token might not be tradable after hitting the limit, which is a honeypot risk.`,
        shouldHide: isUnset('is_anti_whale'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_anti_whale === '1',
        title: msg`Anti_whale(Limited number of transactions)`,
        message: msg`There is an up bound of token transactions. If this kind of limit exists, the token might not be tradable after hitting the limit, which is a honeypot risk.`,
        shouldHide: isUnset('is_anti_whale'),
    },
    // slippage modifiable
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.slippage_modifiable === '0',
        title: msg`Tax cannot be modified`,
        message: msg`The contract owner is not known to be able to modify the transaction tax. If the tax is increased to more than 49%, the tokens will not be able to be traded, which is a honeypot risk.`,
        shouldHide: isUnset('slippage_modifiable'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.slippage_modifiable === '1',
        title: msg`Tax can be modified`,
        message: msg`The contract owner is known to be able to modify the transaction tax. If the tax is increased to more than 49%, the tokens will not be able to be traded, which is a honeypot risk.`,
        shouldHide: isUnset('slippage_modifiable'),
    },
    // black list
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_blacklisted === '0',
        title: msg`No blacklist`,
        message: msg`No blacklist is found. If there is a blacklist, some addresses may be unable to trade normally, which is a honeypot risk.`,
        shouldHide: isUnset('is_blacklisted'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_blacklisted === '1',
        title: msg`Blacklist function`,
        message: msg`A blacklist is found. Some addresses may not be able to trade normally, which is a honeypot risk.`,
        shouldHide: isUnset('is_blacklisted'),
    },
    // white list
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_whitelisted === '0',
        title: msg`No whitelist`,
        message: msg`No whitelist is included. If there is a whitelist, some addresses may not be able to trade normally, which is a honeypot risk.`,
        shouldHide: isUnset('is_whitelisted'),
    },
    {
        type: SecurityType.Transaction,
        level: SecurityMessageLevel.Medium,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_whitelisted === '1',
        title: msg`Whitelist function`,
        message: msg`A whitelist is found. Some addresses may not be able to trade normally, which is a honeypot risk.`,
        shouldHide: isUnset('is_whitelisted'),
    },
    // true token
    {
        type: SecurityType.Info,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_true_token === '1',
        title: msg`True Token`,
        message: msg`This token is issued by its declared team. Some scams will create a fake token with a well-known token name to cheat users.`,
        shouldHide: isUnset('is_true_token'),
    },
    {
        type: SecurityType.Info,
        level: SecurityMessageLevel.High,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_true_token === '0',
        title: msg`Fake Token`,
        message: msg`This token is not issued by its declared team. Some scams will create a fake token with a well-known token name to cheat users.`,
        shouldHide: isUnset('is_true_token'),
    },
    // Airdrop scam
    {
        type: SecurityType.Info,
        level: SecurityMessageLevel.Safe,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_airdrop_scam === '0',
        title: msg`Airdrop Scam`,
        message: msg`You may lose your assets if you give approval to the website of this token.`,
        shouldHide: isUnset('is_airdrop_scam'),
    },
    {
        type: SecurityType.Info,
        level: SecurityMessageLevel.High,
        condition: (info: SecurityAPI.TokenSecurityType) => info.is_airdrop_scam === '1',
        title: msg`No Airdrop Scam`,
        message: msg`This is unlikely to be an airdrop scam. Many scams attract users through airdrops.`,
        shouldHide: isUnset('is_airdrop_scam'),
    },
]
