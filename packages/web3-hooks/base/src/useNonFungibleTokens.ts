import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useNonFungibleTokens<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    // pair: [address, tokenId]
    listOfPairs?: [string, string],
    options?: ConnectionOptions<T>,
) {
    const Web3 = useWeb3Connection(pluginID, options)

    return useAsyncRetry<Array<Web3Helper.NonFungibleTokenScope<S, T>>>(async () => {
        return Promise.all(listOfPairs?.map((x) => Web3.getNonFungibleToken(x[0], x[1], undefined, options)) ?? [])
    }, [Web3, listOfPairs?.join(',')])
}
