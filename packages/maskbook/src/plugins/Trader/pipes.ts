import type BigNumber from 'bignumber.js'
import { Currency, DataProvider, TradeProvider, ZrxTradePool } from './types'
import { unreachable } from '../../utils/utils'
import { WarningLevel } from './types/uniswap'
import {
    BIPS_BASE,
    UNISWAP_PRICE_IMPACT_HIGH,
    UNISWAP_PRICE_IMPACT_LOW,
    UNISWAP_PRICE_IMPACT_MEDIUM,
    UNISWAP_PRICE_IMPACT_NON_EXPERT_BLOCKED,
    UNISWAP_PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN,
} from './constants'

export function resolveCurrencyName(currency: Currency) {
    return [
        currency.name,
        currency.symbol ? `"${currency.symbol}"` : '',
        currency.description ? `(${currency.description})` : '',
    ].join(' ')
}

export function resolveDataProviderName(dataProvider: DataProvider) {
    switch (dataProvider) {
        case DataProvider.COIN_GECKO:
            return 'CoinGecko'
        case DataProvider.COIN_MARKET_CAP:
            return 'CoinMarketCap'
        default:
            unreachable(dataProvider)
    }
}

export function resolveDataProviderLink(dataProvider: DataProvider) {
    switch (dataProvider) {
        case DataProvider.COIN_GECKO:
            return 'https://www.coingecko.com/'
        case DataProvider.COIN_MARKET_CAP:
            return 'https://coinmarketcap.com/'
        default:
            unreachable(dataProvider)
    }
}

export function resolveTradeProviderName(tradeProvider: TradeProvider) {
    switch (tradeProvider) {
        case TradeProvider.UNISWAP:
            return 'Uniswap V2'
        case TradeProvider.ZRX:
            return '0x'
        default:
            unreachable(tradeProvider)
    }
}

export function resolveTradeProviderLink(tradeProvider: TradeProvider) {
    switch (tradeProvider) {
        case TradeProvider.UNISWAP:
            return 'https://uniswap.org/'
        case TradeProvider.ZRX:
            return 'https://0x.org/'
        default:
            unreachable(tradeProvider)
    }
}

export function resolveTradePairLink(tradeProvider: TradeProvider, address: string) {
    switch (tradeProvider) {
        case TradeProvider.UNISWAP:
            return `https://info.uniswap.org/pair/${address}`
        case TradeProvider.ZRX:
            return ''
        default:
            unreachable(tradeProvider)
    }
}

export function resolveDaysName(days: number) {
    if (days === 0) return 'MAX'
    if (days >= 365) return `${Math.floor(days / 365)}y`
    if (days >= 30) return `${Math.floor(days / 30)}m`
    if (days >= 7) return `${Math.floor(days / 7)}w`
    return `${days}d`
}

export function resolveUniswapWarningLevel(priceImpact: BigNumber) {
    const priceImpact_ = priceImpact.multipliedBy(BIPS_BASE)
    if (priceImpact_.isGreaterThan(UNISWAP_PRICE_IMPACT_NON_EXPERT_BLOCKED)) return WarningLevel.BLOCKED
    if (priceImpact_.isGreaterThan(UNISWAP_PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN))
        return WarningLevel.CONFIRMATION_REQUIRED
    if (priceImpact_.isGreaterThan(UNISWAP_PRICE_IMPACT_HIGH)) return WarningLevel.HIGH
    if (priceImpact_.isGreaterThan(UNISWAP_PRICE_IMPACT_MEDIUM)) return WarningLevel.MEDIUM
    if (priceImpact_.isGreaterThan(UNISWAP_PRICE_IMPACT_LOW)) return WarningLevel.LOW
    return
}

export function resolveUniswapWarningLevelColor(warningLevel?: WarningLevel) {
    const COLOR_MAP: EnumRecord<WarningLevel, string> = {
        [WarningLevel.LOW]: 'inherit',
        [WarningLevel.MEDIUM]: '#f3841e',
        [WarningLevel.HIGH]: '#f3841e',
        [WarningLevel.CONFIRMATION_REQUIRED]: '#ff6871',
        [WarningLevel.BLOCKED]: '#ff6871',
    }
    return warningLevel ? COLOR_MAP[warningLevel] : '#27ae60'
}

export function resolveZrxTradePoolName(swapSource: ZrxTradePool) {
    const SWAP_SOURCE_NAME_MAP: EnumRecord<ZrxTradePool, string> = {
        [ZrxTradePool.ZRX]: 'ZRX',
        [ZrxTradePool.Native]: 'Native',
        [ZrxTradePool.Mesh]: 'Mesh',
        [ZrxTradePool.Uniswap]: 'Uniswap',
        [ZrxTradePool.UniswapV2]: 'Uniswap V2',
        [ZrxTradePool.Eth2Dai]: 'Eth2Dai',
        [ZrxTradePool.Kyber]: 'Kyber',
        [ZrxTradePool.Curve]: 'Curve',
        [ZrxTradePool.LiquidityProvider]: 'LiquidityProvider',
        [ZrxTradePool.MultiBridge]: 'MultiBridge',
        [ZrxTradePool.Balancer]: 'Balancer',
        [ZrxTradePool.Cream]: 'CREAM',
        [ZrxTradePool.Bancor]: 'Bancor',
        [ZrxTradePool.MStable]: 'mStable',
        [ZrxTradePool.Mooniswap]: 'Mooniswap',
        [ZrxTradePool.MultiHop]: 'MultiHop',
        [ZrxTradePool.Shell]: 'Shell',
        [ZrxTradePool.Swerve]: 'Swerve',
        [ZrxTradePool.SnowSwap]: 'SnowSwap',
        [ZrxTradePool.SushiSwap]: 'SushiSwap',
        [ZrxTradePool.Dodo]: 'DODO',
        [ZrxTradePool.CryptoCom]: 'CryptoCom',
    }
    return SWAP_SOURCE_NAME_MAP[swapSource]
}
