import { useChainId, useERC20TokenDetailed } from '@masknet/web3-shared-evm'
import { useAsync } from 'react-use'
import { PluginTraderRPC } from '../messages'
import type { Coin, TagType } from '../types'
import type { DataProvider } from '@masknet/public-api'
import { useCurrentCurrency } from './useCurrentCurrency'

export function useTrendingByKeyword(tagType: TagType, keyword: string, dataProvider: DataProvider) {
    const chainId = useChainId()
    const currency = useCurrentCurrency(dataProvider)
    const {
        value: trending,
        loading,
        error,
    } = useAsync(async () => {
        if (!keyword) return null
        if (!currency) return null
        return PluginTraderRPC.getCoinTrendingByKeyword(keyword, tagType, currency, dataProvider)
    }, [chainId, dataProvider, currency?.id, keyword])
    const { value: detailedToken } = useERC20TokenDetailed(trending?.coin.contract_address)
    const coin = {
        ...trending?.coin,
        decimals: trending?.coin.decimals || detailedToken?.decimals || 0,
    } as Coin
    return {
        value: {
            currency: currency,
            trending: trending
                ? {
                      ...trending,
                      coin,
                  }
                : null,
        },
        loading: loading,
        error: error,
    }
}

export function useTrendingById(id: string, dataProvider: DataProvider) {
    const chainId = useChainId()
    const currency = useCurrentCurrency(dataProvider)
    const {
        value: trending,
        loading,
        error,
    } = useAsync(async () => {
        if (!id) return null
        if (!currency) return null
        return PluginTraderRPC.getCoinTrendingById(id, currency, dataProvider)
    }, [chainId, dataProvider, currency?.id, id])

    const { value: detailedToken } = useERC20TokenDetailed(trending?.coin.contract_address)

    const coin = {
        ...trending?.coin,
        decimals: trending?.coin.decimals || detailedToken?.decimals || 0,
    } as Coin

    return {
        value: {
            currency: currency,
            trending: trending
                ? {
                      ...trending,
                      coin,
                  }
                : null,
        },
        loading: loading,
        error: error,
    }
}
