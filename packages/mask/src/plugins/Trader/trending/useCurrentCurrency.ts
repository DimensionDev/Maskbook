import { DataProvider } from '@masknet/public-api'
import type { TrendingAPI } from '@masknet/web3-providers'

const CURRENCIES_MAP: Record<DataProvider, undefined | TrendingAPI.Currency[]> = {
    [DataProvider.CoinGecko]: [
        {
            id: 'usd',
            name: 'USD',
            symbol: '$',
            description: 'Unite State Dollar',
        },
    ],
    [DataProvider.CoinMarketCap]: [
        {
            id: '2781',
            name: 'USD',
            symbol: '$',
            description: 'Unite State Dollar',
        },
    ],
    [DataProvider.UniswapInfo]: [
        {
            id: 'usd',
            name: 'USD',
            symbol: '$',
            description: 'Unite State Dollar',
        },
    ],
    [DataProvider.NFTScan]: [
        {
            id: 'eth',
            name: '\u039E',
            symbol: '\u039E',
            description: 'Ethereum',
        },
    ],
}

/**
 * TODO: support multiple currencies
 * @param dataProvider
 * @returns
 */
export function useCurrentCurrency(dataProvider: DataProvider) {
    return CURRENCIES_MAP[dataProvider]?.[0]
}
