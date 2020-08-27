export interface Settings {
    currency: Currency
}

export enum Platform {
    COIN_GECKO,
    COIN_MARKET_CAP,
}

export interface Currency {
    id: string
    name: string
    symbol?: string
    description?: string
}

export interface Coin {
    id: string
    name: string
    symbol: string
    home_url?: string
    image_url?: string
    description?: string
    market_cap_rank?: number
}

export interface Market {
    current_price: number
    total_volume?: number
    price_change_percentage_24h?: number
    price_change_percentage_1h_in_currency?: number
    price_change_percentage_1y_in_currency?: number
    price_change_percentage_7d_in_currency?: number
    price_change_percentage_14d_in_currency?: number
    price_change_percentage_24h_in_currency?: number
    price_change_percentage_30d_in_currency?: number
    price_change_percentage_60d_in_currency?: number
    price_change_percentage_200d_in_currency?: number
}

export interface Ticker {
    logo_url: string
    trade_url: string
    market_name: string
    base_name: string
    target_name: string
    price: number
    volumn: number
    score: string
}

export interface Trending {
    currency: Currency
    platform: Platform
    coin: Coin
    market: Market
    tickers: Ticker[]
}

export type Stat = [number | string, number]

export function resolveCurrencyName(currency: Currency) {
    return [
        currency.name,
        currency.symbol ? `"${currency.symbol}"` : '',
        currency.description ? `(${currency.description})` : '',
    ].join(' ')
}

export function resolvePlatformName(platform: Platform) {
    switch (platform) {
        case Platform.COIN_GECKO:
            return 'Coin Gecko'
        case Platform.COIN_MARKET_CAP:
            return 'Coin Market Cap'
        default:
            return ''
    }
}

export function resolvePlatformLink(platform: Platform) {
    switch (platform) {
        case Platform.COIN_GECKO:
            return 'https://www.coingecko.com/'
        case Platform.COIN_MARKET_CAP:
            return 'https://coinmarketcap.com/'
        default:
            return ''
    }
}

export function resolveDaysName(days: number) {
    if (days >= 365) return `${Math.floor(days / 365)}y`
    if (days >= 30) return `${Math.floor(days / 30)}m`
    if (days >= 7) return `${Math.floor(days / 7)}w`
    return `${days}d`
}
