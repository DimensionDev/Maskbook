import { useAsyncRetry } from 'react-use'
import { asyncIteratorToArray } from '@masknet/shared-base'
import type { NonFungibleTokenCollection, NetworkPluginID, HubOptions } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from './useAccount'
import { useWeb3Hub } from './useWeb3Hub'

export function useNonFungibleCollections<T extends NetworkPluginID>(
    pluginID?: T,
    chainId?: Web3Helper.Definition[T]['ChainId'],
) {
    type GetAllNonFungibleCollections = (
        address: string,
        options?: HubOptions<Web3Helper.Definition[T]['ChainId']>,
    ) => AsyncIterableIterator<NonFungibleTokenCollection<Web3Helper.Definition[T]['ChainId']>>

    const account = useAccount(pluginID)
    const hub = useWeb3Hub(pluginID)

    return useAsyncRetry(async () => {
        if (!account || !hub) return []
        return asyncIteratorToArray(
            (hub.getAllNonFungibleCollections as GetAllNonFungibleCollections)(account, { chainId }),
        )
    }, [account, chainId, hub])
}
