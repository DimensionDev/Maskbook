import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useWeb3Connection } from './useWeb3Connection.js'
import { useChainContext } from './useContext.js'

export function useNonFungibleToken<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    tokenId?: string,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    options?: ConnectionOptions<T>,
) {
    const { account, chainId } = useChainContext({ account: options?.account, chainId: options?.chainId })
    const Web3 = useWeb3Connection(pluginID, {
        account,
        chainId,
        ...options,
    })

    return useAsyncRetry<Web3Helper.NonFungibleTokenScope<S, T> | undefined>(async () => {
        if (!address || !tokenId) return
        return Web3.getNonFungibleToken(address, tokenId, schemaType)
    }, [address, tokenId, schemaType, Web3])
}
