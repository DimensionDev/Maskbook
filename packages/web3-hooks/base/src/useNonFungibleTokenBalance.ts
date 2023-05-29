import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useNonFungibleTokenBalance<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: ConnectionOptions<T>,
) {
    const Web3 = useWeb3Connection(pluginID, options)

    return useAsyncRetry(async () => {
        if (!address) return '0'
        return Web3.getNonFungibleTokenBalance(address)
    }, [address, Web3])
}
