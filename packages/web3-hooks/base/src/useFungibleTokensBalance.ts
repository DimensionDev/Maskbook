import { useAsyncRetry } from 'react-use'
import { EMPTY_OBJECT, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useFungibleTokensBalance<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    listOfAddress?: string[],
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry(async () => {
        if (!connection || !listOfAddress?.length) return EMPTY_OBJECT
        return connection.getFungibleTokensBalance(listOfAddress, options)
    }, [listOfAddress?.join(), connection, JSON.stringify(options)])
}
