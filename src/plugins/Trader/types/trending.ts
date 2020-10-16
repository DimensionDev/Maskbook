export interface Settings {
    currency: Currency
}

export enum DataProvider {
    COIN_GECKO,
    COIN_MARKET_CAP,
}

export enum SwapProvider {
    UNISWAP,
    // SUSHISWAP,
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
    eth_address?: string
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
    volume: number
    score: string
}

export interface Trending {
    currency: Currency
    dataProvider: DataProvider
    coin: Coin
    market?: Market
    tickers: Ticker[]
    lastUpdated: string
}

export type Stat = [number | string, number]
