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
    image_url?: string
}

export interface Market {
    current_price: number
    total_volume?: number
    price_change_24h?: number
}

export interface Trending {
    currency: Currency
    platform: Platform
    coin: Coin
    market: Market
}

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
