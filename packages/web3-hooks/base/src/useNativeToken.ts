import type {} from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useFungibleToken } from './useFungibleToken.js'
import { useNativeTokenAddress } from './useNativeTokenAddress.js'

export function useNativeToken<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const nativeTokenAddress = useNativeTokenAddress(pluginID, options)
    return useFungibleToken<S, T>(pluginID, nativeTokenAddress, options)
}
