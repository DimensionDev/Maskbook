import { flatten } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAsyncFn } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useFungibleToken } from '@masknet/web3-hooks-base'
import { trending } from '@masknet/web3-providers/helpers'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { TokenType, type NonFungibleTokenActivity } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { PluginTraderRPC } from '../messages.js'
import { useQuery } from '@tanstack/react-query'

export function useNFT_TrendingOverview(
    pluginID: NetworkPluginID,
    id: string, // For nftscan it's address, for simplehash it's collection id.
    expectedChainId?: Web3Helper.ChainIdAll,
) {
    return useQuery({
        queryKey: ['nft-trending-overview', pluginID, expectedChainId, id],
        queryFn: async () => {
            if (!id || !expectedChainId || !pluginID) return null
            return PluginTraderRPC.getNFT_TrendingOverview(pluginID, expectedChainId, id)
        },
    })
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
    const [{ loading: loadingActivities }, fetchActivities] = useAsyncFn(async () => {
        if (!id || !expectedChainId || !pluginID) return

        const result = await PluginTraderRPC.getNonFungibleTokenActivities(
            pluginID,
            expectedChainId,
            id,
            cursorRef.current,
        )

        setNonFungibleTokenActivities((currentActivities) => {
            if (!result || currentActivities[result.cursor] || !result.content) return currentActivities
            cursorRef.current = result.cursor

            return { ...currentActivities, [cursorRef.current]: result.content }
        })
    }, [id, expectedChainId, pluginID])

    useEffect(() => {
        fetchActivities()
    }, [fetchActivities])

    return {
        activities: flatten(Object.values(nonFungibleTokenActivities)),
        fetchActivities,
        loadingActivities,
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
        isPending,
        data: coinTrending,
        error,
    } = useQuery({
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ['get-coin-trending', result, currency?.id],
        queryFn: async () => {
            if (!currency || !result.source) return null
            return PluginTraderRPC.getCoinTrending(result, currency)
        },
    })

    const { data: detailedToken } = useFungibleToken(result.pluginID, coinTrending?.coin.contract_address, undefined, {
        chainId: coinTrending?.coin.chainId as ChainId,
    })

    const trendingData = useMemo(() => {
        if (isPending || error || !coinTrending) return
        return {
            ...coinTrending,
            coin: {
                ...coinTrending.coin,
                id: coinTrending.coin.id ?? '',
                name: coinTrending.coin.name ?? '',
                symbol: coinTrending.coin.symbol ?? '',
                type: coinTrending.coin.type ?? TokenType.Fungible,
                decimals: coinTrending.coin.decimals || detailedToken?.decimals || 0,
                contract_address: coinTrending.coin.contract_address ?? coinTrending.contracts?.[0]?.address ?? address,
                chainId: coinTrending.coin.chainId ?? coinTrending.contracts?.[0]?.chainId ?? chainId,
            },
        }
    }, [isPending, error, coinTrending, detailedToken?.decimals])

    if (isPending) {
        return {
            loading: true,
        }
    }

    if (error) {
        return {
            loading: false,
            error: error as Error,
        }
    }

    return {
        value: {
            currency,
            trending: trendingData,
        },
        loading: isPending,
    }
}

export function useHighestFloorPrice(id: string) {
    return useQuery({
        queryKey: ['highest-floor-price', id],
        queryFn: async () => {
            if (!id) return null
            return PluginTraderRPC.getHighestFloorPrice(id)
        },
    })
}

export function useOneDaySaleAmounts(id: string) {
    return useQuery({
        queryKey: ['one-day-sale-amount', id],
        queryFn: async () => {
            if (!id) return null
            return PluginTraderRPC.getOneDaySaleAmounts(id)
        },
    })
}
