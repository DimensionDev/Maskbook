import { flatten } from 'lodash-es'
import { useRef, useState, useEffect } from 'react'
import { useAsync, useAsyncRetry, useAsyncFn } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { TokenType, type NonFungibleTokenActivity } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useChainContext, useFungibleToken } from '@masknet/web3-hooks-base'
import { PluginTraderRPC } from '../messages.js'
import { useCurrentCurrency } from './useCurrentCurrency.js'

export function useNFT_TrendingOverview(
    pluginID: NetworkPluginID,
    id: string, // For nftscan it's address, for simplehash it's collection id.
    expectedChainId?: Web3Helper.ChainIdAll,
) {
    return useAsync(async () => {
        if (!id || !expectedChainId || !pluginID) return null
        return PluginTraderRPC.getNFT_TrendingOverview(pluginID, expectedChainId, id)
    }, [id, expectedChainId, pluginID])
}

export function useNonFungibleTokenActivities(
    pluginID: NetworkPluginID,
    id: string,
    expectedChainId?: Web3Helper.ChainIdAll,
) {
    const cursorRef = useRef<string>('')
    const [nonFungibleTokenActivities, setNonFungibleTokenActivities] = useState<
        Record<string, Array<NonFungibleTokenActivity<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>>
    >({})
    const [{ loading: loadingNonFungibleTokenActivities }, getNonFungibleTokenActivities] = useAsyncFn(async () => {
        if (!id || !expectedChainId || !pluginID) return

        const result = await PluginTraderRPC.getNonFungibleTokenActivities(
            pluginID,
            expectedChainId,
            id,
            cursorRef.current,
        )

        setNonFungibleTokenActivities((currentActivities) => {
            if (!result || currentActivities[result.cursor] || !result?.content) return currentActivities
            cursorRef.current = result.cursor

            return { ...currentActivities, [cursorRef.current]: result.content }
        })
    }, [id, expectedChainId, pluginID])

    useEffect(() => {
        getNonFungibleTokenActivities()
    }, [getNonFungibleTokenActivities])

    return {
        activities: flatten(Object.values(nonFungibleTokenActivities)),
        fetchMore: getNonFungibleTokenActivities,
        loadingNonFungibleTokenActivities,
    }
}

export function useTrendingById(
    result: Web3Helper.TokenResultAll,
    address?: string,
): AsyncState<{
    currency?: TrendingAPI.Currency
    trending?: TrendingAPI.Trending | null
}> {
    const { chainId } = useChainContext({ chainId: result.chainId })
    const currency = useCurrentCurrency(result.chainId, result.source)

    const {
        value: trending,
        loading,
        error,
    } = useAsync(async () => {
        if (!currency || !result.source) return null
        return PluginTraderRPC.getCoinTrending(result, currency)
    }, [chainId, JSON.stringify(result), currency?.id])

    const { data: detailedToken } = useFungibleToken(result.pluginID, trending?.coin.contract_address, undefined, {
        chainId: trending?.coin.chainId as ChainId,
    })

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
                      coin: {
                          ...trending.coin,
                          id: trending.coin.id ?? '',
                          name: trending.coin.name ?? '',
                          symbol: trending.coin.symbol ?? '',
                          type: trending.coin.type ?? TokenType.Fungible,
                          decimals: trending.coin.decimals || detailedToken?.decimals || 0,
                          contract_address:
                              trending.coin.contract_address ?? trending.contracts?.[0]?.address ?? address,
                          chainId: trending.coin.chainId ?? trending.contracts?.[0]?.chainId ?? chainId,
                      },
                  }
                : null,
        },
        loading,
        error,
    }
}

export function useCoinInfoByAddress(address: string) {
    return useAsyncRetry(async () => {
        if (!address) return
        return PluginTraderRPC.getCoinInfoByAddress(address)
    }, [address])
}

export function useHighestFloorPrice(id: string) {
    return useAsyncRetry(async () => {
        if (!id) return
        return PluginTraderRPC.getHighestFloorPrice(id)
    }, [id])
}

export function useOneDaySaleAmounts(id: string) {
    return useAsyncRetry(async () => {
        if (!id) return
        return PluginTraderRPC.getOneDaySaleAmounts(id)
    }, [id])
}
