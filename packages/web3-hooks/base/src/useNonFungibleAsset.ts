import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useNonFungibleAsset<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    id?: string,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const { account } = useChainContext({ account: options?.account })
    const hub = useWeb3Hub(pluginID, {
        account,
        ...options,
    })

    return useAsyncRetry<Web3Helper.NonFungibleAssetScope<S, T> | undefined>(async () => {
        if (!hub) return
        return hub.getNonFungibleAsset?.(address ?? '', id ?? '', options)
    }, [address, id, hub, JSON.stringify(options)])
}
