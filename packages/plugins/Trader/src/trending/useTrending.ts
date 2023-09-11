import { flatten } from 'lodash-es'
import { useEffect, useRef, useState } from 'react'
import { useAsync, useAsyncFn, useAsyncRetry } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useFungibleToken } from '@masknet/web3-hooks-base'
import { trending } from '@masknet/web3-providers/helpers'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { TokenType, type NonFungibleTokenActivity } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { PluginTraderRPC } from '../messages.js'

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
    const [{ loading }, fetchMore] = useAsyncFn(async () => {
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
        fetchMore()
    }, [fetchMore])

    return {
        activities: flatten(Object.values(nonFungibleTokenActivities)),
        fetchMore,
        loading,
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
    const currency = trending.getCurrency(result.chainId, result.source)

    const {
        value: coinTrending,
        loading,
        error,
    } = useAsync(async () => {
        if (!currency || !result.source) return null
        return PluginTraderRPC.getCoinTrending(result, currency)
    }, [chainId, JSON.stringify(result), currency?.id])

    const { data: detailedToken } = useFungibleToken(result.pluginID, coinTrending?.coin.contract_address, undefined, {
        chainId: coinTrending?.coin.chainId as ChainId,
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
            trending: coinTrending
                ? {
                      ...coinTrending,
                      coin: {
                          ...coinTrending.coin,
                          id: coinTrending.coin.id ?? '',
                          name: coinTrending.coin.name ?? '',
                          symbol: coinTrending.coin.symbol ?? '',
                          type: coinTrending.coin.type ?? TokenType.Fungible,
                          decimals: coinTrending.coin.decimals || detailedToken?.decimals || 0,
                          contract_address:
                              coinTrending.coin.contract_address ?? coinTrending.contracts?.[0]?.address ?? address,
                          chainId: coinTrending.coin.chainId ?? coinTrending.contracts?.[0]?.chainId ?? chainId,
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
