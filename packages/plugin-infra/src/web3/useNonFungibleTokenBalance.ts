import type { NetworkPluginID } from '@masknet/web3-shared-base'
import useAsyncRetry from 'react-use/lib/useAsyncRetry'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3Connection } from './useWeb3Connection'

export function useNonFungibleTokenBalance<T extends NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    type GetNonFungibleTokenBalance = (
        address: string,
        options?: Web3Helper.Web3ConnectionOptions<T>,
    ) => Promise<string>

    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry(async () => {
        if (!address || !connection) return '0'
        return (connection.getNonFungibleTokenBalance as GetNonFungibleTokenBalance)(address)
    }, [address, connection])
}
