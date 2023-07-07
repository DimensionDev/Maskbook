import { CoinGeckoTrending, getCurrency } from '@masknet/web3-providers'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { SourceType } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'

export function useTrending(chainId: ChainId, coinId?: string) {
    return useQuery({
        enabled: !!coinId,
        queryKey: ['coin-trending', 'coin-gecko', chainId, coinId],
        queryFn: async (): Promise<TrendingAPI.Trending | null> => {
            const currency = getCurrency(chainId, SourceType.CoinGecko)
            if (!currency || !coinId) return null
            return CoinGeckoTrending.getCoinTrending(chainId, coinId, currency)
        },
    })
}
