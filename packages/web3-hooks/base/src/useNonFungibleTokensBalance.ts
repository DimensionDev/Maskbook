import useAsyncRetry from 'react-use/lib/useAsyncRetry'
import { EMPTY_OBJECT } from '@masknet/shared-base'

import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useNonFungibleTokensBalance<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    listOfAddress?: string[],
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const connection = useWeb3Connection(pluginID, options)
    return useAsyncRetry(async () => {
        if (!connection) return EMPTY_OBJECT
        return connection.getNonFungibleTokensBalance(listOfAddress ?? [])
    }, [listOfAddress?.join(), connection])
}
