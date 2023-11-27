import { useQuery } from '@tanstack/react-query'
import { CoinGeckoTrending } from '@masknet/web3-providers'
import { trending } from '@masknet/web3-providers/helpers'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { SourceType } from '@masknet/web3-shared-base'
import { useCoinGeckoCoinId } from './useCoinGeckoCoinId.js'

export function useCoinTrendingStats(chainId: number, address?: string, days?: number) {
    const { data: coinId, isPending } = useCoinGeckoCoinId(chainId, address)
    return useQuery({
        enabled: !isPending && days !== undefined,
        queryKey: ['coin-stats', chainId, address, coinId, days],
        queryFn: async (): Promise<TrendingAPI.Stat[] | undefined> => {
            if (!coinId || days === undefined) return

            const currency = trending.getCurrency(chainId, SourceType.CoinGecko)
            if (!currency) return

            return CoinGeckoTrending.getCoinPriceStats(coinId, currency, days)
        },
    })
}
