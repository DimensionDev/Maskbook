import { useAsyncRetry } from 'react-use'
import { asyncIteratorToArray, EMPTY_LIST } from '@masknet/shared-base'
import type { FungibleAsset, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from './useAccount'
import { useWeb3Hub } from './useWeb3Hub'

export function useFungibleAssets<T extends NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.Definition[T]['SchemaType'],
    options?: Web3Helper.Web3HubOptions<T>,
) {
    type GetAllFungibleAssets = (
        address: string,
    ) => AsyncIterableIterator<
        FungibleAsset<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>
    >

    const account = useAccount(pluginID)
    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry(async () => {
        if (!account || !hub) return EMPTY_LIST
        const assets = await asyncIteratorToArray((hub?.getAllFungibleAssets as GetAllFungibleAssets)(account))
        return assets.length && schemaType ? assets.filter((x) => x.schema === schemaType) : assets
    }, [account, schemaType, hub])
}
