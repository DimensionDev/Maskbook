import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useFungibleTokens<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    listOfAddress?: string[],
    options?: ConnectionOptions<T>,
) {
    const Web3 = useWeb3Connection(pluginID, options)

    return useAsyncRetry<Array<Web3Helper.FungibleTokenScope<S, T>>>(async () => {
        if (!listOfAddress?.length) return EMPTY_LIST
        return Promise.all(listOfAddress.map((x) => Web3.getFungibleToken(x)))
    }, [Web3, listOfAddress?.join(',')])
}
