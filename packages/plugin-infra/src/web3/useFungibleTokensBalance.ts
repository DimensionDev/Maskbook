import { EMPTY_OBJECT } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import useAsyncRetry from 'react-use/lib/useAsyncRetry'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3Connection } from './useWeb3Connection'

export function useFungibleTokensBalance<T extends NetworkPluginID>(
    pluginID?: T,
    listOfAddress?: string[],
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    type GetFungibleTokensBalance = (
        listOfAddress: string[],
        options?: Web3Helper.Web3ConnectionOptions<T>,
    ) => Promise<Record<string, string>>

    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry(async () => {
        if (!connection || !listOfAddress?.length) return EMPTY_OBJECT
        return (connection.getFungibleTokensBalance as GetFungibleTokensBalance)(listOfAddress, options)
    }, [listOfAddress?.join(), connection, JSON.stringify(options)])
}
