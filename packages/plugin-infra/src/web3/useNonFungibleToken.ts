import type { NetworkPluginID } from '@masknet/web3-shared-base'
import useAsyncRetry from 'react-use/lib/useAsyncRetry'
import type { Web3Helper } from '../web3-helpers/index.js'
import { useWeb3Connection } from './useWeb3Connection.js'
import { useChainId } from './useChainId.js'
import { useAccount } from './useAccount.js'

export function useNonFungibleToken<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    tokenId?: string,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const chainId = useChainId(pluginID, options?.chainId)
    const account = useAccount(pluginID, options?.account)
    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry<Web3Helper.NonFungibleTokenScope<S, T> | undefined>(async () => {
        if (!address || !tokenId || !connection) return
        return connection.getNonFungibleToken(address, tokenId, schemaType, {
            ...options,
            account: options?.account ?? account,
            chainId: options?.chainId ?? chainId,
        })
    }, [address, tokenId, schemaType, connection, chainId, account])
}
