import { useCallback, useMemo } from 'react'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { HubOptions } from '@masknet/web3-providers/types'
import { type NetworkPluginID, EMPTY_LIST } from '@masknet/shared-base'
import { useChainContext } from './useContext.js'
import { useNetworkDescriptors } from './useNetworkDescriptors.js'
import { useWeb3Hub } from './useWeb3Hub.js'
import { useInfiniteQuery } from '@tanstack/react-query'

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

    const { data, isFetching, fetchNextPage, hasNextPage, refetch, error } = useInfiniteQuery({
        queryKey: ['non-fungible-assets', account, availableChainIds],
        queryFn: async ({ pageParam }) => {
            const chainId = pageParam?.chainId || availableChainIds[0]
            const res = await Hub.getNonFungibleAssets!(account, {
                indicator: pageParam?.indicator,
                size: 20,
                chainId,
            })
            return {
                ...res,
                chainId,
            }
        },
        getNextPageParam: (lastPage) => {
            const { nextIndicator, chainId } = lastPage
            const nextChainId = nextIndicator ? chainId : availableChainIds[availableChainIds.indexOf(chainId) + 1]
            if (!chainId) return
            return {
                indicator: nextIndicator,
                chainId: nextChainId,
            }
        },
    })

    const list = useMemo(() => data?.pages.flatMap((x) => x.data) || EMPTY_LIST, [data?.pages])
    const nextPage = useCallback(() => fetchNextPage(), [fetchNextPage])

    // TODO rename these fields with style of react-query
    return {
        value: list,
        next: nextPage,
        loading: isFetching,
        done: !hasNextPage,
        retry: refetch,
        error,
    }
}
