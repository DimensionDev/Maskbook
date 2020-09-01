import CURRENCY_DATA from './currency.json'

// proxy: https://web-api.coinmarketcap.com/v1
const BASE_URL_v1 = 'https://coinmarketcap.provide.maskbook.com/v1'

// proxy: https://web-api.coinmarketcap.com/v1.1
const BASE_URL_v1_1 = 'https://coinmarketcap.provide.maskbook.com/v1'

const WIDGET_BASE_URL = 'https://widgets.coinmarketcap.com/v2'

export interface Status {
    credit_count: number
    elapsed: number
    error_code: number
    error_message: null | string
    notice: null | string
    timestamp: string
}

//#region get all currency
export function getAllCurrenies() {
    return CURRENCY_DATA
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
    status: 'active'
    symbol: string
}

export async function getAllCoins() {
    const response = await fetch(
        `${BASE_URL_v1}/cryptocurrency/map?aux=status,platform&listing_status=active,untracked&sort=cmc_rank`,
        { cache: 'force-cache' },
    )
    return response.json() as Promise<{
        data: Coin[]
        status: Status
    }>
}
//#endregion

//#regin get coin info
export interface CoinInfo {
    id: number
    name: string
    symbol: string
    website_slug: string
    rank: number
    circulating_supply: number
    total_supply: number
    max_supply: null | number
    quotes: Record<
        string,
        {
            price: number
            volume_24h?: number
            market_cap?: number
            percent_change_1h?: number
            percent_change_24h?: number
            percent_change_7d?: number
        }
    >
    last_updated: number
}

export async function getCoinInfo(id: string, currency: string) {
    const params = new URLSearchParams('ref=widget')
    params.append('convert', currency)

    const response = await fetch(`${WIDGET_BASE_URL}/ticker/${id}/?${params.toString()}`)
    return response.json() as Promise<{
        data: CoinInfo
        status: Status
    }>
}
//#endregion

//#region historical
export type Stat = [number, number, number]

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

    const response = await fetch(`${BASE_URL_v1_1}/cryptocurrency/quotes/historical?${params.toString()}`)
    return response.json() as Promise<{
        data: Record<string, Record<string, Stat>>
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

    const response = await fetch(`${BASE_URL_v1}/cryptocurrency/market-pairs/latest?${params.toString()}`)
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
}
//#endregion
