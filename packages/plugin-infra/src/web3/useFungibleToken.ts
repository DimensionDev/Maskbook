import type { NetworkPluginID } from '@masknet/web3-shared-base'
import useAsyncRetry from 'react-use/lib/useAsyncRetry'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3Connection } from './useWeb3Connection'

export function useFungibleToken<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry<Web3Helper.FungibleTokenScope<S, T> | undefined>(async () => {
        if (!connection || !address) return
        return connection?.getFungibleToken?.(address ?? '', options)
    }, [address, connection, JSON.stringify(options)])
}
