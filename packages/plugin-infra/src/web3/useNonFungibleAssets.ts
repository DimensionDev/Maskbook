import { useAsyncRetry } from 'react-use'
import { asyncIteratorToArray } from '@masknet/shared-base'
import type { FungibleAsset, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'
import { useAccount } from './useAccount'

export function useNonFungibleAssets<T extends NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.Definition[T]['SchemaType'],
) {
    type GetAllNonFungibleAssets = (
        address: string,
    ) => AsyncIterableIterator<
        FungibleAsset<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>
    >

    const { Asset } = useWeb3State(pluginID)
    const account = useAccount(pluginID)

    return useAsyncRetry(async () => {
        if (!account || !Asset) return []
        const assets = await asyncIteratorToArray((Asset.getAllFungibleAssets as GetAllNonFungibleAssets)(account))
        return assets.length && schemaType ? assets.filter((x) => x.schema === schemaType) : assets
    }, [account, schemaType, Asset])
}
