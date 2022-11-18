import { useAsync, useAsyncRetry } from 'react-use'
import type { DataProvider } from '@masknet/public-api'
import { NetworkPluginID } from '@masknet/shared-base'
import type { TrendingAPI } from '@masknet/web3-providers'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { TokenType } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useFungibleToken } from '@masknet/web3-hooks-base'
import { PluginTraderRPC } from '../messages.js'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { Coin, TagType } from '../types/index.js'
import { useCurrentCurrency } from './useCurrentCurrency.js'

export function useTrendingByKeyword(
    tagType: TagType,
    keyword: string,
    dataProvider: DataProvider,
    expectedChainId?: ChainId,
    searchedContractAddress?: string,
): AsyncState<{
    currency?: TrendingAPI.Currency
    trending?: TrendingAPI.Trending | null
}> {
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
        contract_address:
            searchedContractAddress ?? trending?.contracts?.[0]?.address ?? trending?.coin.contract_address,
        chainId: expectedChainId ?? trending?.contracts?.[0]?.chainId ?? trending?.coin.chainId,
    } as Coin
    if (loading) {
        return {
            loading: true,
        }
    }

    if (error) {
        return {
            loading: false,
            error,
        }
    }
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

export function useTrendingById(
    id: string,
    dataProvider: DataProvider,
    expectedChainId?: ChainId,
    searchedContractAddress?: string,
): AsyncState<{ currency: TrendingAPI.Currency | undefined; trending: TrendingAPI.Trending | null }> {
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

    const { value: detailedToken } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        trending?.coin.contract_address,
        undefined,
        { chainId: trending?.coin.chainId },
    )

    if (loading) {
        return {
            loading: true,
        }
    }

    if (error) {
        return {
            loading: false,
            error,
        }
    }

    return {
        value: {
            currency,
            trending: trending
                ? {
                      ...trending,
                      coin: createCoinFromTrending(trending, expectedChainId, searchedContractAddress, detailedToken),
                  }
                : null,
        },
        loading,
        error,
    }
}

function createCoinFromTrending(
    trending?: TrendingAPI.Trending,
    expectedChainId?: ChainId,
    searchedContractAddress?: string,
    token?: Web3Helper.FungibleTokenScope<void, NetworkPluginID.PLUGIN_EVM>,
): Coin {
    return {
        ...trending?.coin,
        id: trending?.coin.id ?? '',
        name: trending?.coin.name ?? '',
        symbol: trending?.coin.symbol ?? '',
        type: trending?.coin.type ?? TokenType.Fungible,
        decimals: trending?.coin.decimals || token?.decimals || 0,
        contract_address:
            searchedContractAddress ?? trending?.contracts?.[0]?.address ?? trending?.coin.contract_address,
        chainId: expectedChainId ?? trending?.contracts?.[0]?.chainId ?? trending?.coin.chainId,
    }
}

export function useCoinInfoByAddress(address: string) {
    return useAsyncRetry(async () => {
        if (!address) return
        return PluginTraderRPC.getCoinInfoByAddress(address)
    }, [address])
}
