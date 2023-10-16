export interface Status {
    credit_count: number
    elapsed: number
    error_code: number
    error_message: null | string
    notice: null | string
    timestamp: string
}

export interface ResultData<T> {
    data: T
    status: Status
}

// #region get all coins
export interface Coin {
    id: number
    name: string
    platform?: {
        id: string
        name: string
        slug: string
        symbol: string
        token_address: string
    }
    rank: number
    slug: string
    status: 'active' | 'untracked'
    symbol: string
}
// #endregion

export interface QuotesInfo {
    circulating_supply: number
    cmc_rank: number
    date_added: string
    id: number
    is_active: boolean
    is_fiat: 0 | 1
    last_updated: string
    max_supply: null | number
    name: string
    num_market_pairs: number
    quote: Record<
        string,
        {
            last_updated: string
            market_cap?: number
            percent_change_1h?: number
            percent_change_7d?: number
            percent_change_24h?: number
            price: number
            volume_24h?: number
        }
    >
    slug: string
    symbol: string
    tags: string[]
    total_supply: number
}

interface PlatformInfo {
    coin: {
        id: string
        name: string
        slug: string
        symbol: string
    }
    name: string
}

interface ContractInfo {
    contract_address: string
    platform: PlatformInfo
}
export interface CoinInfo {
    category: string
    contract_address: ContractInfo[]
    date_added: string
    date_launched: string | null
    description: string
    id: number
    is_hidden: 0 | 1
    logo: string
    name: string
    notice: string
    platform?: {
        id: number
        name: string
        slug: string
        symbol: string
        token_address: string
    }
    slug: string
    status: string
    subreddit: string
    symbol: string
    'tag-groups': string[]
    'tag-names': string[]
    tags: string[]
    twitter_username: string
    urls: {
        announcement?: string[]
        chat?: string[]
        explorer?: string[]
        reddit?: string[]
        source_code?: string[]
        message_board?: string[]
        technical_doc?: string[]
        twitter?: string[]
        website?: string[]
    }
}
export interface Pair {
    exchange: {
        id: number
        name: string
        slug: string
    }
    market_id: number
    market_pair: string
    market_pair_base: {
        currency_id: number
        currency_symbol: string
        currency_type: string
        exchange_symbol: string
    }
    market_pair_quote: {
        currency_id: number
        currency_symbol: string
        currency_type: string
        exchange_symbol: string
    }
    market_reputation: number
    market_score: number
    market_url: string
    outlier_detected: 0 | 1
    quote: Record<
        string,
        {
            effective_liquidity: 0 | 1
            last_updated: string
            price: number
            price_quote: number
            volume_24h: number
        }
    > & {
        exchange_reported: {
            last_updated: string
            price: number
            volume_24h_base: number
            volume_24h_quote: number
        }
    }
}
