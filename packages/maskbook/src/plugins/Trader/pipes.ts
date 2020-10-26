import { Coin, Currency, DataProvider, SwapProvider } from './types'
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

export function resolveDataProviderCoinLink(dataProvider: DataProvider, coin: Coin) {
    switch (dataProvider) {
        case DataProvider.COIN_MARKET_CAP:
            return `https://coinmarketcap.com/currencies/${coin.name.replace(/\s+/g, '-').toLowerCase()}`
        case DataProvider.COIN_GECKO:
            // TODO:
            // `https://www.coingecko.com/en/coins/${coin.name.toLowerCase()}`
            return ''
        default:
            return ''
    }
}

export function resolveSwapProviderName(swapProvider: SwapProvider) {
    switch (swapProvider) {
        case SwapProvider.UNISWAP:
            return 'Uniswap'
        default:
            unreachable(swapProvider)
    }
}

export function resolveSwapProviderLink(swapProvider: SwapProvider) {
    switch (swapProvider) {
        case SwapProvider.UNISWAP:
            return 'https://uniswap.org/'
        default:
            unreachable(swapProvider)
    }
}

export function resolveDaysName(days: number) {
    if (days === 0) return 'MAX'
    if (days >= 365) return `${Math.floor(days / 365)}y`
    if (days >= 30) return `${Math.floor(days / 30)}m`
    if (days >= 7) return `${Math.floor(days / 7)}w`
    return `${days}d`
}
