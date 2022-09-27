import { DataProvider } from '@masknet/public-api'

const CURRENCIES_MAP: Record<
    DataProvider,
    | undefined
    | Array<{
          id: string
          name: string
          symbol: string
          description: string
      }>
> = {
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
