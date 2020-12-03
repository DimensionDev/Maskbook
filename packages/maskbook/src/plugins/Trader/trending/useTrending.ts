import { useAsync } from 'react-use'
import { PluginTraderRPC } from '../messages'
import type { DataProvider } from '../types'
import { useCurrentCurrency } from './useCurrentCurrency'

export function useTrending(keyword: string, dataProvider: DataProvider) {
    const currencyAsyncResult = useCurrentCurrency(dataProvider)
    const trendingAsyncResult = useAsync(async () => {
        if (!currencyAsyncResult.value) return null
        return PluginTraderRPC.getCoinTrendingByKeyword(keyword, dataProvider, currencyAsyncResult.value)
    }, [dataProvider, currencyAsyncResult.value, keyword])
    return {
        value: {
            currency: currencyAsyncResult.value,
            trending: trendingAsyncResult.value,
        },
        loading: currencyAsyncResult.loading || trendingAsyncResult.loading,
        error: currencyAsyncResult.error || trendingAsyncResult.error,
    }
}
