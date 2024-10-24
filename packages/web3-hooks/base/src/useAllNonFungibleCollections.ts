import { useQuery } from '@tanstack/react-query'
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
import { FireflyConfig } from '@masknet/web3-providers'

export function useAllNonFungibleCollections<
    S extends 'all' | void = void,
    T extends NetworkPluginID = NetworkPluginID,
>(pluginID?: T) {
    const { account } = useChainContext()

    return useQuery<Array<NonFungibleCollection<Web3Helper.ChainIdScope<S, T>, Web3Helper.SchemaTypeScope<S, T>>>>({
        queryKey: ['all-non-fungible-collections', pluginID, account],
        enabled: !!account,
        queryFn: async () => {
            if (!account) return EMPTY_LIST
            return asyncIteratorToArray(
                pageableToIterator(async (indicator?: PageIndicator) => {
                    return FireflyConfig.getCollectionsByOwner(account, indicator)
                }),
            )
        },
    })
}
