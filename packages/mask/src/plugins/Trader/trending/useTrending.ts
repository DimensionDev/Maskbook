import { useAsync, useAsyncRetry } from 'react-use'
import type { DataProvider } from '@masknet/public-api'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useFungibleToken } from '@masknet/web3-hooks-base'
import { PluginTraderRPC } from '../messages.js'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { Coin, TagType } from '../types/index.js'
import { useCurrentCurrency } from './useCurrentCurrency.js'

export function useTrendingByKeyword(tagType: TagType, keyword: string, dataProvider: DataProvider) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
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
        contract_address: trending?.contracts?.[0]?.address ?? trending?.coin.contract_address,
        chainId: trending?.contracts?.[0]?.chainId ?? trending?.coin.chainId,
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

export function useTrendingById(id: string, dataProvider: DataProvider, expectedChainId?: ChainId) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    const currency = useCurrentCurrency(dataProvider)
    const {
        value: trending,
        loading,
        error,
    } = useAsync(async () => {
        if (!id) return null
        if (!currency) return null
        return PluginTraderRPC.getCoinTrending(chainId, id, currency, dataProvider).catch(() => null)
    }, [chainId, dataProvider, currency?.id, id])

    const { value: detailedToken } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, trending?.coin.contract_address)

    const coin = {
        ...trending?.coin,
        decimals: trending?.coin.decimals || detailedToken?.decimals || 0,
        contract_address: trending?.contracts?.[0]?.address ?? trending?.coin.contract_address,
        chainId: trending?.contracts?.[0]?.chainId ?? trending?.coin.chainId,
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

export function useCoinIdByAddress(address: string, chainIdList: ChainId[]) {
    return useAsyncRetry(() => {
        return PluginTraderRPC.getCoinIdByAddress(address, chainIdList)
    }, [address, JSON.stringify(chainIdList)])
}
