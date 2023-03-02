export interface ThumbCoin {
    id: string
    name: string
    symbol: string
    api_symbol: string
    market_cap_rank: number
    thumb: string
    large: string
}

export interface ThumbCollection {
    id: string
    name: string
    symbol: string
    thumb: string
}

export interface Category {
    id: string
    name: string
}

export interface Exchange {
    id: string
    name: string
    market_type: 'spot' | 'futures'
    thumb: string
    large: string
}

export interface CoinInfo {
    asset_platform_id: string
    block_time_in_minutes: number
    categories: string[]
    contract_address: string
    description: Record<string, string>
    developer_score: number
    id: string
    image: {
        large: string
        small: string
        thumb: string
    }
    last_updated: string
    links: {
        announcement_url: string[]
        bitcointalk_thread_identifier: null
        blockchain_site: string[]
        chat_url: string[]
        facebook_username: string
        homepage: string[]
        official_forum_url: string[]
        repos_url: { github: string[]; bitbucket: string[] }
        subreddit_url: string
        telegram_channel_identifier: string
        twitter_screen_name: string
    }
    liquidity_score: string
    localization: Record<string, string>
    market_cap_rank: number
    market_data: {
        current_price: Record<string, number>
        high_24h: Record<string, number>
        low_24h: Record<string, number>
        market_cap: Record<string, number>
        market_cap_rank: number

        price_change_percentage_1h_in_currency: number
        price_change_percentage_1y_in_currency: number
        price_change_percentage_7d_in_currency: number
        price_change_percentage_14d_in_currency: number
        price_change_percentage_24h_in_currency: number
        atl_change_percentage?: number
        price_change_percentage_30d_in_currency: number
        price_change_percentage_60d_in_currency: number
        price_change_percentage_200d_in_currency: number

        total_supply: number
        total_volume: Record<string, number>
    }
    platforms: Record<string, string>
    name: string
    symbol: string
    tickers: Array<{
        base: string
        target: string
        market: {
            name: 'string'
            identifier: string
            has_trading_incentive: boolean
            logo: string
        }
        last: number
        volume: number
        converted_last: {
            btc: number
            eth: number
            usd: number
        }
        converted_volume: {
            btc: number
            eth: number
            usd: number
        }
        trust_score: 'green'
        bid_ask_spread_percentage: number
        timestamp: string
        last_traded_at: string
        last_fetch_at: string
        is_anomaly: boolean
        is_stale: boolean
        trade_url: string
        coin_id: string
        target_coin_id?: string
    }>
}

export interface Platform {
    id?: string
    chain_identifier?: number
    name: string
    shortname: string
}
