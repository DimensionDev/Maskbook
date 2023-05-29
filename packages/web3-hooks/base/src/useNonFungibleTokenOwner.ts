import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useNonFungibleTokenOwner<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID: T,
    address: string,
    tokenId: string,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    options?: ConnectionOptions<T>,
) {
    const Web3 = useWeb3Connection(pluginID, options)

    return useAsyncRetry(async () => {
        if (!address) return
        return Web3.getNonFungibleTokenOwner?.(address, tokenId, schemaType)
    }, [address, schemaType, Web3])
}
