import type { NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import useAsyncRetry from 'react-use/lib/useAsyncRetry'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3Connection } from './useWeb3Connection'

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

    return useAsyncRetry(async () => {
        if (!address || !id || !connection) return
        return (connection.getNonFungibleToken as GetNonFungibleToken)(address, id)
    }, [address, id, connection])
}
