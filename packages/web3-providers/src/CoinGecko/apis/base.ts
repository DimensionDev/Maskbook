import urlcat from 'urlcat'
import { Days } from '@masknet/shared-base'
import { CurrencyType, type Price } from '@masknet/web3-shared-base'
import { COINGECKO_URL_BASE } from '../constants.js'
import type { Category, CoinInfo, Exchange, ThumbCoin, ThumbCollection } from '../types.js'
import { fetchCachedJSON } from '../../helpers/fetchJSON.js'
import type { TrendingAPI } from '../../entry-types.js'

function fetchFromCoinGecko<T>(request: RequestInfo | URL, init?: RequestInit) {
    return fetchCachedJSON<T>(request, init)
}

// #region coins
export async function getAllCoins() {
    return fetchFromCoinGecko<TrendingAPI.Coin[]>(urlcat(COINGECKO_URL_BASE, '/coins/list'), { cache: 'force-cache' })
}

export async function getCoinInfo(coinId: string) {
    return fetchFromCoinGecko<
        | CoinInfo
        | {
              error: string
          }
    >(
        urlcat(COINGECKO_URL_BASE, `/coins/${coinId}`, {
            developer_data: false,
            community_data: false,
            tickers: true,
        }),
        {
            cache: 'default',
        },
    )
}

export async function getThumbCoins(keyword: string) {
    if (!keyword) return []
    const response = await fetchFromCoinGecko<
        | {
              categories: Category[]
              coins: ThumbCoin[]
              nfts: ThumbCollection[]
              exchanges: Exchange[]
          }
        | { error: string }
    >(
        urlcat(COINGECKO_URL_BASE, '/search', {
            query: keyword,
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
    return fetchFromCoinGecko<{
        market_caps: Stat[]
        prices: Stat[]
        total_volumes: Stat[]
    }>(
        urlcat(COINGECKO_URL_BASE, `/coins/${coinId}/market_chart`, {
            vs_currency: currencyId,
            days: days === Days.MAX ? 11430 : days,
        }),
        {
            cache: 'default',
        },
    )
}
// #endregion

// #region token price
export async function getTokenPrice(platform_id: string, address: string, currencyType = CurrencyType.USD) {
    const price = await getTokenPrices(platform_id, [address], currencyType)
    const currencies = price[address.toLowerCase()]
    if (!currencies) return 0
    return Number(currencies[currencyType] || 0)
}

export async function getTokensPrice(listOfAddress: string[], currencyType = CurrencyType.USD) {
    const response = await fetchFromCoinGecko<Record<string, Record<CurrencyType, number>>>(
        urlcat(COINGECKO_URL_BASE, '/simple/price', {
            ids: listOfAddress,
            vs_currencies: currencyType,
        }),
        undefined,
    )

    return Object.fromEntries(
        Object.keys(response).map((address) => [address, response[address.toLowerCase()][currencyType]]),
    )
}

export async function getTokenPrices(platform_id: string, contractAddresses: string[], currency = CurrencyType.USD) {
    return fetchFromCoinGecko<Record<string, Price>>(
        urlcat(COINGECKO_URL_BASE, '/simple/token_price/:platform_id', {
            platform_id,
            contract_addresses: contractAddresses.join(','),
            vs_currencies: currency,
        }),
        undefined,
    )
}

export async function getTokenPriceByCoinId(coin_id: string, currency = CurrencyType.USD) {
    const price = await fetchFromCoinGecko<Record<string, Record<CurrencyType, number>>>(
        urlcat(COINGECKO_URL_BASE, '/simple/price', { ids: coin_id, vs_currencies: currency }),
        undefined,
    )
    return price[coin_id]?.[currency] ?? 0
}
// #endregion
