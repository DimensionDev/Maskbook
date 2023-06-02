import { useAsyncRetry } from 'react-use'
import { EMPTY_OBJECT, type NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useFungibleTokensBalance<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    listOfAddress?: string[],
    options?: ConnectionOptions<T>,
) {
    const Web3 = useWeb3Connection(pluginID, options)

    return useAsyncRetry(async () => {
        if (!listOfAddress?.length) return EMPTY_OBJECT
        return Web3.getFungibleTokensBalance(listOfAddress)
    }, [listOfAddress?.join(','), Web3])
}
