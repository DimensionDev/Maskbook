import type { NetworkPluginID, PageIndicator } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { OrderSide } from '@masknet/web3-shared-base'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useNonFungibleListings<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    id?: string,
    options?: HubOptions<T>,
) {
    const { account } = useChainContext({ account: options?.account })
    const Hub = useWeb3Hub(pluginID, {
        account,
        ...options,
    } as HubOptions<T>)

    return useInfiniteQuery({
        queryKey: ['non-fungible', 'orders', pluginID, address, id, options],
        initialPageParam: undefined as PageIndicator | undefined,
        queryFn: ({ pageParam: nextIndicator }) => {
            return Hub.getNonFungibleTokenOrders(address ?? '', id ?? '', OrderSide.Sell, {
                indicator: nextIndicator,
            })
        },
        getNextPageParam: (x) => x.nextIndicator as PageIndicator | undefined,
    })
}
