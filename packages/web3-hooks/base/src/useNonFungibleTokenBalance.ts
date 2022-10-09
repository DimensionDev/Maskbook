import useAsyncRetry from 'react-use/lib/useAsyncRetry'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useNonFungibleTokenBalance<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry(async () => {
        if (!address || !connection) return '0'
        return connection.getNonFungibleTokenBalance(address)
    }, [address, connection])
}
