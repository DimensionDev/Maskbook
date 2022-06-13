import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID, NonFungibleTokenContract } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3Connection } from './useWeb3Connection'

export function useNonFungibleTokenContract<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID: T,
    address: string,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry<
        NonFungibleTokenContract<Web3Helper.ChainIdScope<S, T>, Web3Helper.SchemaTypeScope<S, T>> | undefined
    >(async () => {
        if (!connection || !address || !options) return
        return connection.getNonFungibleTokenContract?.(address, schemaType, options)
    }, [address, schemaType, connection, JSON.stringify(options)])
}
