import type { NetworkPluginID } from '@masknet/web3-shared-base'
import useAsyncRetry from 'react-use/lib/useAsyncRetry'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3Connection } from './useWeb3Connection'

export function useFungibleTokenBalance<T extends NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    type GetFungibleTokenBalance = (address: string, options?: Web3Helper.Web3ConnectionOptions<T>) => Promise<string>

    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry(async () => {
        if (!connection || !address) return '0'
        return (connection.getFungibleTokenBalance as GetFungibleTokenBalance)(address ?? '', options)
    }, [address, connection, JSON.stringify(options)])
}
