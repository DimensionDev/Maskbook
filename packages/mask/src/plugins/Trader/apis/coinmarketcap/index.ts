import { CMC_V1_BASE_URL, THIRD_PARTY_V1_BASE_URL } from '../../constants'
import { Flags } from '../../../../../shared'

export interface Status {
    credit_count: number
    elapsed: number
    error_code: number
    error_message: null | string
    notice: null | string
    timestamp: string
}

export interface Currency {
    id: number
    name: string
    symbol: string
    token: string
    space: string
}

//#region get all currency
export function getAllCurrencies(): Currency[] {
    return []
}
//#endregion

//#region get all coins
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

export async function getAllCoins() {
    const response = await fetch(
        `${CMC_V1_BASE_URL}/cryptocurrency/map?aux=status,platform&listing_status=active,untracked&sort=cmc_rank`,
        { cache: 'force-cache' },
    )
    return response.json() as Promise<{
        data: Coin[]
        status: Status
    }>
}
//#endregion

//#regin get quote info
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

export async function getQuotesInfo(id: string, currency: string) {
    const params = new URLSearchParams()
    params.append('id', id)
    params.append('convert', currency)

    try {
        const response = await fetch(`${THIRD_PARTY_V1_BASE_URL}/cryptocurrency/widget?${params.toString()}`, {
            cache: Flags.trader_all_api_cached_enabled ? 'force-cache' : 'default',
        })
        return response.json() as Promise<{
            data: Record<string, QuotesInfo>
            status: Status
        }>
    } catch {
        return {
            data: null,
        }
    }
}
//#endregion

//#region get coin info
export interface PlatformInfo {
    coin: {
        id: string
        name: string
        slug: string
        symbol: string
    }
    name: string
}

export interface ContractInfo {
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

export async function getCoinInfo(id: string) {
    const params = new URLSearchParams('aux=urls,logo,description,tags,platform,date_added,notice,status')
    params.append('id', id)

    const response_ = await fetch(`${CMC_V1_BASE_URL}/cryptocurrency/info?${params.toString()}`, {
        cache: Flags.trader_all_api_cached_enabled ? 'force-cache' : 'default',
    })
    const response = (await response_.json()) as {
        /** id, coin-info pair */
        data: Record<string, CoinInfo>
        status: Status
    }
    return {
        data: response.data[id],
        status: response.status,
    }
}
//#endregion

//#region historical
export type Stat = [number, number, number]
export interface HistoricalCoinInfo {
    id: number
    is_active: 0 | 1
    is_fiat: 0 | 1
    name: string
    quotes: []
    symbol: string
}

export async function getHistorical(
    id: string,
    currency: string,
    startDate: Date,
    endDate: Date,
    interval: string = '1d',
) {
    const toUnixTimestamp = (d: Date) => String(Math.floor(d.getTime() / 1000))
    const params = new URLSearchParams('format=chart_crypto_details')
    params.append('convert', currency)
    params.append('id', id)
    params.append('interval', interval)
    params.append('time_end', toUnixTimestamp(endDate))
    params.append('time_start', toUnixTimestamp(startDate))

    const response = await fetch(`${CMC_V1_BASE_URL}/cryptocurrency/quotes/historical?${params.toString()}`, {
        cache: Flags.trader_all_api_cached_enabled ? 'force-cache' : 'default',
    })
    return response.json() as Promise<{
        data: Record<string, Record<string, Stat>> | HistoricalCoinInfo
        status: Status
    }>
}
//#endregion

//#region latest market pairs
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
export async function getLatestMarketPairs(id: string, currency: string) {
    const params = new URLSearchParams(
        'aux=num_market_pairs,market_url,price_quote,effective_liquidity,market_score,market_reputation&limit=40&sort=cmc_rank&start=1',
    )
    params.append('convert', currency)
    params.append('id', id)

    try {
        const response = await fetch(`${CMC_V1_BASE_URL}/cryptocurrency/market-pairs/latest?${params.toString()}`, {
            cache: Flags.trader_all_api_cached_enabled ? 'force-cache' : 'default',
        })
        return response.json() as Promise<{
            data: {
                id: number
                market_pairs: Pair[]
                name: string
                num_market_pairs: number
                symbol: string
            }
            status: Status
        }>
    } catch {
        return {
            data: {
                id,
                market_pairs: [] as Pair[],
                num_market_pairs: 0,
            },
        }
    }
}
//#endregion
