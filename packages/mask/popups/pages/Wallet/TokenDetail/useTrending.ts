import { CoinGeckoTrending } from '@masknet/web3-providers'
import { trending } from '@masknet/web3-providers/helpers'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { SourceType } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { useCoinGeckoCoinId } from './useCoinGeckoCoinId.js'

export function useTrending(chainId: ChainId, address?: string) {
    const { data: coinId, isPending } = useCoinGeckoCoinId(chainId, address)
    return useQuery({
        enabled: !isPending,
        queryKey: ['coin-trending', 'coin-gecko', chainId, coinId, address],
        queryFn: async (): Promise<TrendingAPI.Trending | null | undefined> => {
            const currency = trending.getCurrency(chainId, SourceType.CoinGecko)
            if (!currency || !coinId) return null

            return CoinGeckoTrending.getCoinTrending(chainId, coinId, currency)
        },
    })
}
