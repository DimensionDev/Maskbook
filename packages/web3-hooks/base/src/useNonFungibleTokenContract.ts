import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import type { NonFungibleTokenContract } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useNonFungibleTokenContract<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    options?: ConnectionOptions<T>,
) {
    const Web3 = useWeb3Connection(pluginID, options)

    return useAsyncRetry<
        NonFungibleTokenContract<Web3Helper.ChainIdScope<S, T>, Web3Helper.SchemaTypeScope<S, T>> | undefined
    >(async () => {
        if (!address) return
        return Web3.getNonFungibleTokenContract?.(address, schemaType)
    }, [address, schemaType, Web3])
}
