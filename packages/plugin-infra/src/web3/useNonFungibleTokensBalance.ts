import { EMPTY_OBJECT } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import useAsyncRetry from 'react-use/lib/useAsyncRetry'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3Connection } from './useWeb3Connection'

export function useNonFungibleTokensBalance<T extends NetworkPluginID>(
    pluginID?: T,
    listOfAddress?: string[],
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    type GetNonFungibleTokensBalance = (
        listOfAddress: string[],
        options?: Web3Helper.Web3ConnectionOptions<T>,
    ) => Promise<Record<string, string>>

    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry(async () => {
        if (!connection) return EMPTY_OBJECT
        return (connection.getNonFungibleTokensBalance as GetNonFungibleTokensBalance)(listOfAddress ?? [])
    }, [listOfAddress?.join(), connection])
}
