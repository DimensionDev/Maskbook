export interface Settings {
    currency: Currency
}

export enum DataProvider {
    COIN_GECKO,
    COIN_MARKET_CAP,
    UNISWAP_INFO,
}

export enum TagType {
    CASH = 1,
    HASH,
}

export interface Currency {
    id: string
    name: string
    symbol?: string
    description?: string
}

export interface Platform {
    id: string | number
    name: string
    slug: string
    symbol: string
}

export interface Coin {
    id: string
    name: string
    symbol: string
    decimals?: number
    is_mirrored?: boolean
    platform_url?: string
    tags?: string[]
    tech_docs_urls?: string[]
    message_board_urls?: string[]
    source_code_urls?: string[]
    community_urls?: string[]
    home_urls?: string[]
    announcement_urls?: string[]
    blockchain_urls?: string[]
    image_url?: string
    description?: string
    market_cap_rank?: number
    contract_address?: string
    facebook_url?: string
    twitter_url?: string
    telegram_url?: string
}

export interface Market {
    current_price: number
    circulating_supply?: number
    market_cap?: number
    max_supply?: number
    total_supply?: number
    total_volume?: number
    price_change_percentage_1h?: number
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
    price?: number
    volume: number
    score?: string
    updated: Date
}

export interface Trending {
    currency: Currency
    dataProvider: DataProvider
    coin: Coin
    platform?: Platform
    market?: Market
    tickers: Ticker[]
    lastUpdated: string
}

export type Stat = [number | string, number]
