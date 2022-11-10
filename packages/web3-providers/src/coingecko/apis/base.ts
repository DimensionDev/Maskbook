import urlcat from 'urlcat'
import { CurrencyType, Price } from '@masknet/web3-shared-base'
import type { TrendingAPI } from '../../types/index.js'
import { fetchJSON } from '../../helpers.js'
import { COINGECKO_URL_BASE } from '../constants.js'
import type { Category, CoinInfo, Exchange, ThumbCoin, ThumbCollection } from '../types.js'

// #region coins
export async function getAllCoins() {
    return fetchJSON<TrendingAPI.Coin[]>(`${COINGECKO_URL_BASE}/coins/list`, { cache: 'force-cache' })
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

export async function getThumbCoins(keyword: string) {
    if (!keyword) return []
    const response = await fetchJSON<
        | {
              categories: Category[]
              coins: ThumbCoin[]
              nfts: ThumbCollection[]
              exchanges: Exchange[]
          }
        | { error: string }
    >(
        urlcat(`${COINGECKO_URL_BASE}/search`, {
            qeery: keyword,
        }),
        {
            cache: 'default',
        },
    )
    if ('error' in response) throw new Error(response.error)
    return response.coins
}
// #endregion

// #region price chart
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

// #region token price
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
