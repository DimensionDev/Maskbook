import urlcat from 'urlcat'
import { CurrencyType, Price } from '@masknet/web3-shared-base'
import { fetchJSON } from '../../helpers.js'
import type { TrendingAPI } from '../../types/index.js'
import { COINGECKO_URL_BASE } from '../constants.js'

// #region get currency
export async function getAllCurrencies() {
    return fetchJSON<string[]>(`${COINGECKO_URL_BASE}/simple/supported_vs_currencies`, {
        cache: 'force-cache',
    })
}
// #endregion

// #region get coins list
export async function getAllCoins() {
    return fetchJSON<TrendingAPI.Coin[]>(`${COINGECKO_URL_BASE}/coins/list`, { cache: 'force-cache' })
}
// #endregion

// #region get coin info
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
        repos_url: {
            github: string[]
            bitbucket: string[]
        }
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

export async function getCoinInfo(coinId: string) {
    return fetchJSON<
        | CoinInfo
        | {
              error: string
          }
    >(`${COINGECKO_URL_BASE}/coins/${coinId}?developer_data=false&community_data=false&tickers=true`, {
        cache: 'default',
    })
}
// #endregion

// #region get price chart
export type Stat = [number, number]

export async function getPriceStats(coinId: string, currencyId: string, days: number) {
    const params = new URLSearchParams()
    params.append('vs_currency', currencyId)
    params.append('days', String(days))

    return fetchJSON<{
        market_caps: Stat[]
        prices: Stat[]
        total_volumes: Stat[]
    }>(`${COINGECKO_URL_BASE}/coins/${coinId}/market_chart?${params.toString()}`, {
        cache: 'default',
    })
}
// #endregion

// #region get token price
export async function getTokenPrice(platform_id: string, address: string, currencyType = CurrencyType.USD) {
    const price = await getTokenPrices(platform_id, [address], currencyType)

    return Number(price[address.toLowerCase()][currencyType]) ?? 0
}

export async function getTokensPrice(listOfAddress: string[], currencyType = CurrencyType.USD) {
    const requestPath = `${COINGECKO_URL_BASE}/simple/price?ids=${listOfAddress}&vs_currencies=${currencyType}`
    const response = await fetchJSON<Record<string, Record<CurrencyType, number>>>(requestPath)

    return Object.fromEntries(
        Object.keys(response).map((address) => [address, response[address.toLowerCase()][currencyType]]),
    )
}

export async function getTokenPrices(platform_id: string, contractAddresses: string[], currency = CurrencyType.USD) {
    const addressList = contractAddresses.join(',')
    const requestPath = urlcat(COINGECKO_URL_BASE, '/simple/token_price/:platform_id', {
        platform_id,
        ['contract_addresses']: addressList,
        ['vs_currencies']: currency,
    })

    return fetchJSON<Record<string, Price>>(requestPath)
}

export async function getTokenPriceByCoinId(coin_id: string, currency = CurrencyType.USD) {
    const requestPath = urlcat(`${COINGECKO_URL_BASE}/simple/price`, { ids: coin_id, ['vs_currencies']: currency })
    const price = await fetchJSON<Record<string, Record<CurrencyType, number>>>(requestPath)
    return price[coin_id][currency]
}
// #endregion
