import { useChainId } from '@masknet/web3-shared-evm'
import { useAsync } from 'react-use'
import { PluginTraderRPC } from '../messages'
import type { TagType } from '../types'
import type { DataProvider } from '@masknet/public-api'
import { useCurrentCurrency } from './useCurrentCurrency'

export function useTrendingByKeyword(tagType: TagType, keyword: string, dataProvider: DataProvider) {
    const chainId = useChainId()
    const currency = useCurrentCurrency(dataProvider)
    const trendingAsyncResult = useAsync(async () => {
        if (!keyword) return null
        if (!currency) return null
        return PluginTraderRPC.getCoinTrendingByKeyword(keyword, tagType, currency, dataProvider)
    }, [chainId, dataProvider, currency?.id, keyword])
    return {
        value: {
            currency: currency,
            trending: trendingAsyncResult.value,
        },
        loading: trendingAsyncResult.loading,
        error: trendingAsyncResult.error,
    }
}

export function useTrendingById(id: string, dataProvider: DataProvider) {
    const chainId = useChainId()
    const currency = useCurrentCurrency(dataProvider)
    const trendingAsyncResult = useAsync(async () => {
        if (!id) return null
        if (!currency) return null
        return PluginTraderRPC.getCoinTrendingById(id, currency, dataProvider)
    }, [chainId, dataProvider, currency?.id, id])
    return {
        value: {
            currency: currency,
            trending: trendingAsyncResult.value,
        },
        loading: trendingAsyncResult.loading,
        error: trendingAsyncResult.error,
    }
}
