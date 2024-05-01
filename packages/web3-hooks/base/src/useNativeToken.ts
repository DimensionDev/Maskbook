import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useFungibleToken } from './useFungibleToken.js'
import { useNativeTokenAddress } from './useNativeTokenAddress.js'

export function useNativeToken<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: ConnectionOptions<T>,
) {
    const nativeTokenAddress = useNativeTokenAddress(pluginID, options)
    return useFungibleToken<S, T>(pluginID, nativeTokenAddress, undefined, options)
}
