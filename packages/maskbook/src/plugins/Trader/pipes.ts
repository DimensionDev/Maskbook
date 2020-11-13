import { Currency, DataProvider, TradeProvider, TradePool } from './types'
import { unreachable } from '../../utils/utils'

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
            return 'Coin Gecko'
        case DataProvider.COIN_MARKET_CAP:
            return 'Coin Market Cap'
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
            return 'Uniswap'
        case TradeProvider.ZRX:
            return 'ZRX (0x)'
        case TradeProvider.ONE_INCH:
            return '1inch'
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
        case TradeProvider.ONE_INCH:
            return 'https://1inch.exchange/'
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

export function resolveTradePoolName(swapSource: TradePool) {
    const SWAP_SOURCE_NAME_MAP: EnumRecord<TradePool, string> = {
        [TradePool.ZRX]: 'ZRX',
        [TradePool.Uniswap]: 'Uniswap',
        [TradePool.UniswapV2]: 'Uniswap_V2',
        [TradePool.Eth2Dai]: 'Eth2Dai',
        [TradePool.Kyber]: 'Kyber',
        [TradePool.Curve]: 'Curve',
        [TradePool.LiquidityProvider]: 'LiquidityProvider',
        [TradePool.MultiBridge]: 'MultiBridge',
        [TradePool.Balancer]: 'Balancer',
        [TradePool.Cream]: 'CREAM',
        [TradePool.Bancor]: 'Bancor',
        [TradePool.MStable]: 'mStable',
        [TradePool.Mooniswap]: 'Mooniswap',
        [TradePool.MultiHop]: 'MultiHop',
        [TradePool.Shell]: 'Shell',
        [TradePool.Swerve]: 'Swerve',
        [TradePool.SnowSwap]: 'SnowSwap',
        [TradePool.SushiSwap]: 'SushiSwap',
        [TradePool.Dodo]: 'DODO',
    }
    return SWAP_SOURCE_NAME_MAP[swapSource]
}
