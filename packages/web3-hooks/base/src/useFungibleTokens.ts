import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useFungibleTokens<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    listOfAddress?: string[],
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const connection = useWeb3Connection<S>(pluginID, options)

    return useAsyncRetry<Array<Web3Helper.FungibleTokenScope<S, T>>>(async () => {
        if (!connection || !listOfAddress?.length) return EMPTY_LIST
        return Promise.all(listOfAddress.map((x) => connection.getFungibleToken(x)))
    }, [connection, listOfAddress?.join(',')])
}
