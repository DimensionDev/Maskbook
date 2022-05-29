import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3Connection } from './useWeb3Connection'

export function useFungibleTokens<T extends NetworkPluginID>(
    pluginID?: T,
    listOfAddress?: string[],
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry<
        Array<FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>
    >(async () => {
        if (!connection) return EMPTY_LIST
        return Promise.all(listOfAddress?.map((x) => connection.getFungibleToken(x)) ?? [])
    }, [connection, listOfAddress?.join()])
}
