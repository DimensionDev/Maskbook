import { useAsyncRetry } from 'react-use'
import { asyncIteratorToArray } from '@masknet/shared-base'
import type { NonFungibleAsset, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from './useAccount'
import { useWeb3Hub } from './useWeb3Hub'

export function useNonFungibleAssets<T extends NetworkPluginID, Indicator extends string | number = number>(
    pluginID?: T,
    schemaType?: Web3Helper.Definition[T]['SchemaType'],
    options?: Web3Helper.Web3HubOptions<T, Indicator>,
) {
    type GetAllNonFungibleAssets = (
        address: string,
    ) => AsyncIterableIterator<
        NonFungibleAsset<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>
    >

    const account = useAccount(pluginID)
    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry(async () => {
        if (!account || !hub) return []
        const assets = await asyncIteratorToArray((hub.getAllNonFungibleAssets as GetAllNonFungibleAssets)(account))
        return assets.length && schemaType ? assets.filter((x) => x.schema === schemaType) : assets
    }, [account, schemaType, hub])
}
