import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers/index.js'
import { useAccount } from '../entry-web3.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useNonFungibleAsset<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    id?: string,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const account = useAccount(pluginID, options?.account)
    const hub = useWeb3Hub(pluginID, {
        account,
        ...options,
    })

    return useAsyncRetry<Web3Helper.NonFungibleAssetScope<S, T> | undefined>(async () => {
        if (!hub) return
        return hub.getNonFungibleAsset?.(address ?? '', id ?? '')
    }, [address, id, hub])
}
