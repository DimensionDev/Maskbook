import { useAsync, useAsyncRetry, useAsyncFn } from 'react-use'
import { useRef, useState, useEffect } from 'react'
import { flatten } from 'lodash-es'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { DSearch } from '@masknet/web3-providers'
import {
    SourceType,
    TokenType,
    attemptUntil,
    NonFungibleTokenActivity,
    SearchResultType,
    NonFungibleCollectionResult,
} from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ChainId } from '@masknet/web3-shared-evm'
import { useChainContext, useFungibleToken, useWeb3State } from '@masknet/web3-hooks-base'
import { PluginTraderRPC } from '../messages.js'
import type { Coin } from '../types/index.js'
import { useCurrentCurrency } from './useCurrentCurrency.js'

const NFTSCAN_CHAIN_ID_LIST = [ChainId.Mainnet, ChainId.BSC, ChainId.Matic]

export function useTrendingOverviewByAddress(address: string) {
    return useAsync(async () => {
        if (!address) return null
        return PluginTraderRPC.getNFT_TrendingOverview(address)
    }, [address])
}

export function useCollectionByTwitterHandler(twitterHandler?: string) {
    return useAsync(async () => {
        if (!twitterHandler) return
        return DSearch.search<NonFungibleCollectionResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>(
            twitterHandler,
            SearchResultType.NonFungibleCollection,
        )
    }, [twitterHandler])
}

export function useNonFungibleTokenActivities(
    pluginID: NetworkPluginID,
    address: string,
    expectedChainId?: Web3Helper.ChainIdAll,
) {
    const cursorRef = useRef<string>('')
    const { Others } = useWeb3State(pluginID)
    const [nonFungibleTokenActivities, setNonFungibleTokenActivities] = useState<
        Record<string, NonFungibleTokenActivity[]>
    >({})
    const [{ loading: loadingNonFungibleTokenActivities }, getNonFungibleTokenActivities] = useAsyncFn(async () => {
        if (!address || !expectedChainId || !Others?.isValidChainId(expectedChainId)) return

        const result = await PluginTraderRPC.getNonFungibleTokenActivities(expectedChainId, address, cursorRef.current)

        setNonFungibleTokenActivities((currentActivities) => {
            if (!result || currentActivities[result.cursor] || !result?.content) return currentActivities
            cursorRef.current = result.cursor

            return { ...currentActivities, [cursorRef.current]: result.content }
        })
    }, [address, expectedChainId])

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
    id: string,
    dataProvider: SourceType | undefined,
    expectedChainId?: Web3Helper.ChainIdAll,
    searchedContractAddress?: string,
): AsyncState<{
    currency?: TrendingAPI.Currency
    trending?: TrendingAPI.Trending | null
}> {
    const { chainId } = useChainContext({ chainId: expectedChainId })
    const currency = useCurrentCurrency(dataProvider)
    const { Others } = useWeb3State()
    const {
        value: trending,
        loading,
        error,
    } = useAsync(async () => {
        if (!id) return null
        if (!currency) return null
        if (!dataProvider) return null
        if ((!expectedChainId || !Others?.isValidChainId(expectedChainId)) && dataProvider === SourceType.NFTScan) {
            return attemptUntil(
                NFTSCAN_CHAIN_ID_LIST.map((chainId) => async () => {
                    try {
                        return PluginTraderRPC.getCoinTrending(chainId, id, currency, SourceType.NFTScan).catch(
                            () => null,
                        )
                    } catch {
                        return undefined
                    }
                }),
                undefined,
            )
        }
        return PluginTraderRPC.getCoinTrending(chainId, id, currency, dataProvider).catch(() => null)
    }, [chainId, dataProvider, currency?.id, id])

    const { value: detailedToken } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        trending?.coin.contract_address,
        undefined,
        { chainId: trending?.coin.chainId as ChainId },
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
    expectedChainId?: Web3Helper.ChainIdAll,
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
