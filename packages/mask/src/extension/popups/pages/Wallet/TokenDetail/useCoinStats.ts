import { CoinGeckoTrending, getCurrency } from '@masknet/web3-providers'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { SourceType } from '@masknet/web3-shared-base'
import { useQuery } from '@tanstack/react-query'
import { useCoinGeckoCoinId } from './useCoinGeckoCoinId.js'

export function useCoinStats(chainId: number, address?: string, days?: number) {
    const { data: coinId, isLoading } = useCoinGeckoCoinId(chainId, address)
    return useQuery({
        enabled: !isLoading && days !== undefined,
        queryKey: ['coin-stats', chainId, address, coinId, days],
        queryFn: async (): Promise<TrendingAPI.Stat[] | undefined> => {
            if (!coinId || days === undefined) return
            const currency = getCurrency(chainId, SourceType.CoinGecko)
            if (!currency) return

            return CoinGeckoTrending.getCoinPriceStats(chainId, coinId, currency, days)
        },
    })
}
