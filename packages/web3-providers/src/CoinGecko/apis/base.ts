import urlcat from 'urlcat'
import { Days } from '@masknet/shared-base'
import { CurrencyType, type Price } from '@masknet/web3-shared-base'
import { COINGECKO_URL_BASE } from '../constants.js'
import type { CoinInfo } from '../types.js'
import { fetchCachedJSON } from '../../helpers/fetchJSON.js'

function fetchFromCoinGecko<T>(request: RequestInfo | URL, init?: RequestInit) {
    return fetchCachedJSON<T>(request, init)
}

// #region coins

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

// #endregion

// #region price chart
type Stat = [number, number]

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
    return currencies?.[currencyType] ? Number(currencies[currencyType]) : undefined
}

async function getTokenPrices(platform_id: string, contractAddresses: string[], currency = CurrencyType.USD) {
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
    return price[coin_id]?.[currency]
}
// #endregion
