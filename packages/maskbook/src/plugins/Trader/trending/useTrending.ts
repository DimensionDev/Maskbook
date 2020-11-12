import { useAsync } from 'react-use'
import { PluginTraderRPC } from '../messages'
import type { DataProvider, Currency } from '../types'

export function useTrending(keyword: string, platform: DataProvider, currency: Currency | null) {
    const { value: trending, loading: loadingTrending, error: errorTrending } = useAsync(async () => {
        if (!currency) return null
        try {
            return PluginTraderRPC.getCoinTrendingByKeyword(keyword, platform, currency)
        } catch (e) {
            return null
        }
    }, [platform, currency, keyword])
    return {
        value: trending,
        loading: loadingTrending,
        error: errorTrending,
    }
}
