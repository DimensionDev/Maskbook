import { CoinGeckoTrending, getCurrency } from '@masknet/web3-providers'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { SourceType } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { useCoinGeckoCoinId } from './useCoinGeckoCoinId.js'

export function useTrending(chainId: ChainId, address?: string) {
    const { data: coinId, isLoading } = useCoinGeckoCoinId(chainId, address)
    return useQuery({
        enabled: !isLoading,
        queryKey: ['coin-trending', 'coin-gecko', chainId, coinId, address],
        queryFn: async (): Promise<TrendingAPI.Trending | undefined> => {
            const currency = getCurrency(chainId, SourceType.CoinGecko)
            if (!currency || !coinId) return
            return CoinGeckoTrending.getCoinTrending(chainId, coinId, currency)
        },
    })
}
