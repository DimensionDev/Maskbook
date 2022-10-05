import useAsyncRetry from 'react-use/lib/useAsyncRetry'

import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useFungibleToken<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry<Web3Helper.FungibleTokenScope<S, T> | undefined>(async () => {
        if (!connection) return
        return connection?.getFungibleToken?.(address ?? '', options)
    }, [address, connection, JSON.stringify(options)])
}
