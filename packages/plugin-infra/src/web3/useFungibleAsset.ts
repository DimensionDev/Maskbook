import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { FungibleAsset, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3Hub } from './useWeb3Hub'

export function useFungibleAsset<T extends NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    type GetFungibleAsset = (
        address: string,
        options?: Web3Helper.Web3ConnectionOptions<T>,
    ) => Promise<FungibleAsset<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>

    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry(async () => {
        if (!address) return EMPTY_LIST
        return (hub?.getFungibleAsset as GetFungibleAsset | undefined)?.(address)
    }, [address, hub?.getFungibleAsset])
}
