import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useNonFungibleTokens<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    // pair: [address, tokenId]
    listOfPairs?: [string, string],
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry<Array<Web3Helper.NonFungibleTokenScope<S, T>>>(async () => {
        if (!connection) return EMPTY_LIST
        return Promise.all(
            listOfPairs?.map((x) => connection.getNonFungibleToken(x[0], x[1], undefined, options)) ?? [],
        )
    }, [connection, listOfPairs?.join()])
}
