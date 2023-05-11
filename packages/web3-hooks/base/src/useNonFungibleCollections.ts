import {
    asyncIteratorToArray,
    pageableToIterator,
    type PageIndicator,
    type NetworkPluginID,
    EMPTY_LIST,
} from '@masknet/shared-base'
import { type NonFungibleCollection } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'
import { useQuery } from '@tanstack/react-query'

export function useNonFungibleCollections<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const { account } = useChainContext({ account: options?.account, chainId: options?.chainId })
    const hub = useWeb3Hub(pluginID, options)

    const enabled = !!account && !!hub
    return useQuery<Array<NonFungibleCollection<Web3Helper.ChainIdScope<S, T>, Web3Helper.SchemaTypeScope<S, T>>>>({
        queryKey: [pluginID, options],
        keepPreviousData: true,
        enabled,
        queryFn: async () => {
            if (!enabled) return EMPTY_LIST
            return asyncIteratorToArray(
                pageableToIterator(async (indicator?: PageIndicator) => {
                    if (!hub.getNonFungibleCollectionsByOwner) return
                    return hub.getNonFungibleCollectionsByOwner(account, {
                        indicator,
                        size: 50,
                        networkPluginId: pluginID,
                        ...options,
                    })
                }),
            )
        },
    })
}
