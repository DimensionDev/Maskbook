import { EMPTY_LIST } from '@masknet/shared-base'
import { CoinGeckoTrending, getCurrency } from '@masknet/web3-providers'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { SourceType } from '@masknet/web3-shared-base'
import { useQuery } from '@tanstack/react-query'
import { useCoinGeckoCoinId } from './useCoinGeckoCoinId.js'

export function useCoinStats(chainId: number, address?: string, days?: number) {
    const coinId = useCoinGeckoCoinId(chainId, address)
    return useQuery({
        enabled: !!coinId && days !== undefined,
        queryKey: ['coin-stats', chainId, address, coinId, days],
        queryFn: async (): Promise<TrendingAPI.Stat[] | undefined> => {
            if (!coinId || days === undefined) return EMPTY_LIST
            const currency = getCurrency(chainId, SourceType.CoinGecko)
            if (!currency) return EMPTY_LIST

            return CoinGeckoTrending.getCoinPriceStats(chainId, coinId, currency, days)
        },
    })
}
