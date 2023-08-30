import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useBlockedNonFungibleTokens } from './useBlockedNonFungibleTokens.js'
import { useChainContext } from './useContext.js'
import { useNetworkDescriptors } from './useNetworkDescriptors.js'
import { useWeb3Hub } from './useWeb3Hub.js'

/**
 * Blocked tokens would be filtered out
 */
export function useNonFungibleAssets<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    options?: HubOptions<T>,
) {
    const { account, chainId } = useChainContext({ account: options?.account })
    const Hub = useWeb3Hub(pluginID, { account, chainId, ...options })
    const networks = useNetworkDescriptors(pluginID)
    const availableChainIds = useMemo(() => {
        return networks
            .filter((x) => x.isMainnet && (options?.chainId ? x.chainId === options.chainId : true))
            .map((x) => x.chainId)
    }, [networks, options?.chainId])

    const blockedTokens = useBlockedNonFungibleTokens()
    const blockedTokenIds = useMemo(() => {
        return blockedTokens.filter((x) => availableChainIds.includes(x.chainId)).map((x) => x.id)
    }, [blockedTokens, availableChainIds])
    const { data, isLoading, fetchNextPage, hasNextPage, refetch, error, dataUpdatedAt } = useInfiniteQuery({
        queryKey: ['non-fungible-assets', account, availableChainIds, blockedTokenIds],
        queryFn: async ({ pageParam }) => {
            const chainId = pageParam?.chainId || availableChainIds[0]
            const res = await Hub.getNonFungibleAssets!(account, {
                indicator: pageParam?.indicator,
                size: 20,
                chainId,
            })
            const data = blockedTokenIds.length
                ? res.data.filter((x) => {
                      const id = `${x.chainId}.${x.address}.${x.tokenId}`.toLowerCase()
                      return !blockedTokenIds.includes(id)
                  })
                : res.data
            return {
                ...res,
                data,
                chainId,
            }
        },
        getNextPageParam: (lastPage) => {
            const { nextIndicator, chainId } = lastPage
            const nextChainId = nextIndicator ? chainId : availableChainIds[availableChainIds.indexOf(chainId) + 1]
            if (!nextChainId) return
            return {
                indicator: nextIndicator,
                chainId: nextChainId,
            }
        },
    })

    const list = useMemo(() => data?.pages.flatMap((x) => x.data) || EMPTY_LIST, [data?.pages])
    const nextPage = useCallback(() => fetchNextPage(), [fetchNextPage])

    // TODO rename these fields in style of react-query
    return {
        value: list,
        next: nextPage,
        loading: isLoading,
        done: !hasNextPage,
        retry: refetch,
        error,
        dataUpdatedAt,
    }
}
