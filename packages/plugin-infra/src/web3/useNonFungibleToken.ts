import { NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import useAsyncRetry from 'react-use/lib/useAsyncRetry'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3Connection } from './useWeb3Connection'
import { useChainId } from './useChainId'
import { useAccount } from './useAccount'

export function useNonFungibleToken<T extends NetworkPluginID>(
    pluginID?: T,
    address?: string,
    id?: string,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    type GetNonFungibleToken = (
        address: string,
        id: string,
        options?: Web3Helper.Web3ConnectionOptions<T>,
    ) => Promise<NonFungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>

    const connection = useWeb3Connection(pluginID, options)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)

    return useAsyncRetry(async () => {
        if (!address || !id || !connection) return
        return (connection.getNonFungibleToken as GetNonFungibleToken)(address, id, {
            ...options,
            account: options?.account ?? account,
            chainId: options?.chainId ?? chainId,
        } as Web3Helper.Web3ConnectionOptions<T>)
    }, [address, id, connection, chainId, account])
}
