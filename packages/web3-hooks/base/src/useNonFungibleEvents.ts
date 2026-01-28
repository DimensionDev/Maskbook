import type { NetworkPluginID, PageIndicator, Pageable } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useInfiniteQuery, type InfiniteData, type UseInfiniteQueryResult } from '@tanstack/react-query'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'
import type { NonFungibleTokenEvent } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useNonFungibleEvents<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    id?: string,
    options?: HubOptions<T>,
): UseInfiniteQueryResult<
    InfiniteData<
        Pageable<
            NonFungibleTokenEvent<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>
        >
    >
> {
    const { account } = useChainContext({ account: options?.account })
    const Hub = useWeb3Hub(pluginID, {
        account,
        ...options,
    } as HubOptions<T>)
    return useInfiniteQuery({
        queryKey: ['non-fungible', 'events', pluginID, address, id, options],
        initialPageParam: undefined as PageIndicator | undefined,
        queryFn: ({ pageParam: nextIndicator }) => {
            return Hub.getNonFungibleTokenEvents(address ?? '', id ?? '', {
                indicator: nextIndicator,
            })
        },
        getNextPageParam: (x) => x.nextIndicator as PageIndicator | undefined,
    })
}
