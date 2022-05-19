import { useAsyncRetry } from 'react-use'
import { asyncIteratorToArray, EMPTY_LIST } from '@masknet/shared-base'
import type { FungibleAsset, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'
import { useAccount } from './useAccount'

export function useFungibleAssets<T extends NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.Definition[T]['SchemaType'],
) {
    type GetAllFungibleAssets = (
        address: string,
    ) => AsyncIterableIterator<
        FungibleAsset<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>
    >

    const { Asset } = useWeb3State(pluginID)
    const account = useAccount(pluginID)

    return useAsyncRetry(async () => {
        if (!account || !Asset) return EMPTY_LIST
        const assets = await asyncIteratorToArray((Asset.getAllFungibleAssets as GetAllFungibleAssets)(account))
        return assets.length && schemaType ? assets.filter((x) => x.schema === schemaType) : assets
    }, [account, schemaType, Asset?.getAllFungibleAssets])
}
