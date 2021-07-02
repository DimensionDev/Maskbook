import { useChainId } from '@masknet/web3-shared'
import { useAsync } from 'react-use'
import { PluginTraderRPC } from '../messages'
import type { DataProvider, TagType } from '../types'
import { useCurrentCurrency } from './useCurrentCurrency'

export function useTrendingByKeyword(tagType: TagType, keyword: string, dataProvider: DataProvider) {
    const chainId = useChainId()
    const currencyAsyncResult = useCurrentCurrency(dataProvider)
    const trendingAsyncResult = useAsync(async () => {
        if (!keyword) return null
        if (!currencyAsyncResult.value) return null
        return PluginTraderRPC.getCoinTrendingByKeyword(keyword, tagType, currencyAsyncResult.value, dataProvider)
    }, [chainId, dataProvider, currencyAsyncResult.value, keyword])
    return {
        value: {
            currency: currencyAsyncResult.value,
            trending: trendingAsyncResult.value,
        },
        loading: currencyAsyncResult.loading || trendingAsyncResult.loading,
        error: currencyAsyncResult.error || trendingAsyncResult.error,
    }
}

export function useTrendingById(id: string, dataProvider: DataProvider) {
    const chainId = useChainId()
    const currencyAsyncResult = useCurrentCurrency(dataProvider)
    const trendingAsyncResult = useAsync(async () => {
        if (!id) return null
        if (!currencyAsyncResult.value) return null
        return PluginTraderRPC.getCoinTrendingById(id, currencyAsyncResult.value, dataProvider)
    }, [chainId, dataProvider, currencyAsyncResult.value, id])
    return {
        value: {
            currency: currencyAsyncResult.value,
            trending: trendingAsyncResult.value,
        },
        loading: currencyAsyncResult.loading || trendingAsyncResult.loading,
        error: currencyAsyncResult.error || trendingAsyncResult.error,
    }
}
