import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useNonFungibleTokenOwnership<
    S extends 'all' | void = void,
    T extends NetworkPluginID = NetworkPluginID,
>(
    pluginID: T,
    address: string,
    tokenId: string,
    owner: string,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry(async () => {
        if (!connection || !address) return
        return connection.getNonFungibleTokenOwnership?.(address, tokenId, owner, schemaType)
    }, [address, schemaType, connection])
}
