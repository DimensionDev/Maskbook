import { useAsyncRetry } from 'react-use'
import type { NonFungibleAsset, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from '../entry-web3'
import { useWeb3Hub } from './useWeb3Hub'

export function useNonFungibleAsset<T extends NetworkPluginID>(
    pluginID?: T,
    address?: string,
    id?: string,
    options?: Web3Helper.Web3HubOptions<T>,
) {
    type GetNonFungibleAsset = (
        address: string,
        id: string,
    ) => Promise<NonFungibleAsset<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>

    const account = useAccount(pluginID)
    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry(async () => {
        if (!address || !id || !hub) return
        return (hub.getNonFungibleAsset as GetNonFungibleAsset)(address, id)
    }, [address, account, id, hub])
}
