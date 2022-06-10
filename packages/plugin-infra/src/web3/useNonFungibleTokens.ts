import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3Connection } from './useWeb3Connection'

export function useNonFungibleTokens<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    // pair: [address, tokenId]
    listOfPairs?: [string, string],
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry<Array<Web3Helper.NonFungibleTokenScope<S, T>>>(async () => {
        if (!connection) return EMPTY_LIST
        return Promise.all(listOfPairs?.map((x) => connection.getNonFungibleToken(x[0], x[1], options)) ?? [])
    }, [connection, listOfPairs?.join()])
}
