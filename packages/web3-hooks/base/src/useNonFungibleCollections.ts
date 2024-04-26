import { useQuery } from '@tanstack/react-query'
import {
    asyncIteratorToArray,
    pageableToIterator,
    type PageIndicator,
    type NetworkPluginID,
    EMPTY_LIST,
} from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { type NonFungibleCollection } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useNonFungibleCollections<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: HubOptions<T>,
) {
    const { account } = useChainContext({ account: options?.account, chainId: options?.chainId })
    const Hub = useWeb3Hub(pluginID, options)

    return useQuery<Array<NonFungibleCollection<Web3Helper.ChainIdScope<S, T>, Web3Helper.SchemaTypeScope<S, T>>>>({
        queryKey: ['non-fungible-collections', pluginID, account, options],
        enabled: !!account,
        queryFn: async () => {
            if (!account) return EMPTY_LIST
            return asyncIteratorToArray(
                pageableToIterator(async (indicator?: PageIndicator) => {
                    return Hub.getNonFungibleCollectionsByOwner(account, {
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
