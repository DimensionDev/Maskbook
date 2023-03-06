import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Hub } from './useWeb3Hub.js'
import { useChainContext } from './useContext.js'

export function useNonFungibleRarity<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
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

    return useAsyncRetry(async () => {
        if (!hub) return
        if (!address && !id) return
        return hub.getNonFungibleRarity?.(address || '', id || '', options)
    }, [address, id, hub])
}
