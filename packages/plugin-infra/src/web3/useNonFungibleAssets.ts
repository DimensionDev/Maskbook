import { useAsyncRetry } from 'react-use'
import { asyncIteratorToArray, EMPTY_LIST } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from './useAccount'
import { useWeb3Hub } from './useWeb3Hub'

export function useNonFungibleAssets<
    S extends 'all' | void = void,
    T extends NetworkPluginID = NetworkPluginID,
    Indicator = number,
>(
    pluginID?: T,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    options?: Web3Helper.Web3HubOptionsScope<S, T, Indicator>,
) {
    const account = useAccount(pluginID, options?.account)
    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry<Array<Web3Helper.NonFungibleAssetScope<S, T>> | undefined>(async () => {
        if (!account || !hub) return EMPTY_LIST
        const assets = await asyncIteratorToArray(hub.getAllNonFungibleAssets?.(account))
        return assets.length && schemaType ? assets.filter((x) => x.schema === schemaType) : assets
    }, [account, schemaType, hub])
}
