import { SourceType } from '@masknet/web3-shared-base'
import type { TrendingAPI } from '../entry-types.js'

export const CURRENCIES_MAP: Record<SourceType, undefined | TrendingAPI.Currency[]> = {
    [SourceType.CoinGecko]: [
        {
            id: 'usd',
            name: 'USD',
            symbol: '$',
            description: 'Unite State Dollar',
        },
    ],
    [SourceType.UniswapInfo]: undefined,
    [SourceType.Zerion]: undefined,
    [SourceType.GoPlus]: undefined,
    [SourceType.Approval]: undefined,
    [SourceType.R2D2]: undefined,
    [SourceType.DeBank]: undefined,
    [SourceType.Flow]: undefined,
    [SourceType.Solana]: undefined,
    [SourceType.CF]: undefined,
    [SourceType.Chainbase]: undefined,
    [SourceType.Rabby]: undefined,
}
