import type { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import useAsyncRetry from 'react-use/lib/useAsyncRetry'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3Connection } from './useWeb3Connection'

export function useFungibleToken<T extends NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    type GetFungibleToken = (
        address: string,
        options?: Web3Helper.Web3ConnectionOptions<T>,
    ) => Promise<FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>

    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry(async () => {
        if (!address || !connection) return
        return (connection?.getFungibleToken as GetFungibleToken)(address)
    }, [address, connection])
}
