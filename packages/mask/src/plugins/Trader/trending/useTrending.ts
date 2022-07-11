import { useAsync } from 'react-use'
import { PluginTraderRPC } from '../messages'
import type { Coin, TagType } from '../types'
import type { DataProvider } from '@masknet/public-api'
import { useCurrentCurrency } from './useCurrentCurrency'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId, useFungibleToken } from '@masknet/plugin-infra/web3'

export function useTrendingByKeyword(tagType: TagType, keyword: string, dataProvider: DataProvider) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const currency = useCurrentCurrency(dataProvider)
    const {
        value: trending,
        loading,
        error,
    } = useAsync(async () => {
        if (!keyword) return null
        if (!currency) return null
        return PluginTraderRPC.getCoinTrendingByKeyword(chainId, keyword, tagType, currency, dataProvider)
    }, [chainId, dataProvider, currency?.id, keyword])
    const { value: detailedToken } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, trending?.coin.contract_address)
    const coin = {
        ...trending?.coin,
        decimals: trending?.coin.decimals || detailedToken?.decimals || 0,
        contract_address: trending?.contracts?.[0]?.address,
        chainId: trending?.contracts?.[0]?.chainId,
    } as Coin
    return {
        value: {
            currency,
            trending: trending
                ? {
                      ...trending,
                      coin,
                  }
                : null,
        },
        loading,
        error,
    }
}

export function useTrendingById(id: string, dataProvider: DataProvider) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const currency = useCurrentCurrency(dataProvider)
    const {
        value: trending,
        loading,
        error,
    } = useAsync(async () => {
        if (!id) return null
        if (!currency) return null
        return PluginTraderRPC.getCoinTrendingById(chainId, id, currency, dataProvider).catch(() => null)
    }, [chainId, dataProvider, currency?.id, id])

    const { value: detailedToken } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, trending?.coin.contract_address)

    const coin = {
        ...trending?.coin,
        decimals: trending?.coin.decimals || detailedToken?.decimals || 0,
        contract_address: trending?.contracts?.[0]?.address,
        chainId: trending?.contracts?.[0]?.chainId,
    } as Coin

    return {
        value: {
            currency,
            trending: trending
                ? {
                      ...trending,
                      coin,
                  }
                : null,
        },
        loading,
        error,
    }
}
