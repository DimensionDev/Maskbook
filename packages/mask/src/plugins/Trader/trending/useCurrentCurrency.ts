import { SourceType } from '@masknet/web3-shared-base'
import type { TrendingAPI } from '@masknet/web3-providers/types'

export const CURRENCIES_MAP: Record<SourceType, undefined | TrendingAPI.Currency[]> = {
    [SourceType.CoinGecko]: [
        {
            id: 'usd',
            name: 'USD',
            symbol: '$',
            description: 'Unite State Dollar',
        },
    ],
    [SourceType.CoinMarketCap]: [
        {
            id: '2781',
            name: 'USD',
            symbol: '$',
            description: 'Unite State Dollar',
        },
    ],
    [SourceType.NFTScan]: [
        {
            id: 'eth',
            name: '\u039E',
            symbol: '\u039E',
            description: 'Ethereum',
        },
    ],
    [SourceType.UniswapInfo]: undefined,
    [SourceType.X2Y2]: undefined,
    [SourceType.Chainbase]: undefined,
    [SourceType.Zerion]: undefined,
    [SourceType.Rarible]: undefined,
    [SourceType.OpenSea]: undefined,
    [SourceType.Alchemy_EVM]: undefined,
    [SourceType.LooksRare]: undefined,
    [SourceType.Zora]: undefined,
    [SourceType.Gem]: undefined,
    [SourceType.GoPlus]: undefined,
    [SourceType.Rabby]: undefined,
    [SourceType.R2D2]: undefined,
    [SourceType.DeBank]: undefined,
    [SourceType.Flow]: undefined,
    [SourceType.Solana]: undefined,
    [SourceType.RSS3]: undefined,
    [SourceType.Alchemy_FLOW]: undefined,
    [SourceType.MagicEden]: undefined,
    [SourceType.Element]: undefined,
    [SourceType.Solsea]: undefined,
    [SourceType.Solanart]: undefined,
    [SourceType.RaritySniper]: undefined,
    [SourceType.TraitSniper]: undefined,
    [SourceType.CF]: undefined,
}

/**
 * TODO: support multiple currencies
 * @param dataProvider
 * @returns
 */
export function useCurrentCurrency(dataProvider: SourceType | undefined) {
    return dataProvider ? CURRENCIES_MAP[dataProvider]?.[0] : undefined
}
