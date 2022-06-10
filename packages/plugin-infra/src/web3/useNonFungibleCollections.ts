import { useAsyncRetry } from 'react-use'
import { asyncIteratorToArray } from '@masknet/shared-base'
import type { NetworkPluginID, NonFungibleTokenCollection } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from './useAccount'
import { useWeb3Hub } from './useWeb3Hub'

export function useNonFungibleCollections<
    S extends 'all' | void = void,
    T extends NetworkPluginID = NetworkPluginID,
    Indicator = number,
>(pluginID?: T, options?: Web3Helper.Web3HubOptionsScope<S, T, Indicator>) {
    const account = useAccount(pluginID, options?.account)
    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry<Array<NonFungibleTokenCollection<Web3Helper.ChainIdScope<S, T>>>>(async () => {
        if (!account || !hub) return []
        return asyncIteratorToArray(hub.getAllNonFungibleCollections?.(account))
    }, [account, hub])
}
