import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID, NonFungibleTokenContract } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3Connection } from './useWeb3Connection'

export function useNonFungibleTokenContract<T extends NetworkPluginID>(
    pluginID: T,
    address: string,
    options: Web3Helper.Web3ConnectionOptions<T>,
) {
    type GetNonFungibleTokenContract = (
        address: string,
        options: Web3Helper.Web3ConnectionOptions<T>,
    ) => Promise<NonFungibleTokenContract<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>
    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry(async () => {
        if (!connection || !address || !options) return
        return (connection.getNonFungibleTokenContract as GetNonFungibleTokenContract)(address, options)
    }, [address, connection, JSON.stringify(options)])
}
