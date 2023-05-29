import { useAsyncRetry } from 'react-use'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useNonFungibleAsset<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    id?: string,
    options?: HubOptions<T>,
) {
    const { account } = useChainContext({ account: options?.account })
    const Hub = useWeb3Hub(pluginID, {
        account,
        ...options,
    })

    return useAsyncRetry<Web3Helper.NonFungibleAssetScope<S, T> | undefined>(async () => {
        if (!address || (!id && pluginID !== NetworkPluginID.PLUGIN_SOLANA)) return
        return Hub.getNonFungibleAsset(address ?? '', id ?? '')
    }, [address, id, Hub])
}
