import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useFungibleAsset<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: ConnectionOptions<T>,
) {
    const Hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry<Web3Helper.FungibleAssetScope<S, T> | undefined>(async () => {
        if (!address) return
        return Hub.getFungibleAsset(address)
    }, [address, Hub.getFungibleAsset])
}
