import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useFungibleToken } from './useFungibleToken'
import { useNativeTokenAddress } from './useNativeTokenAddress'

export function useNativeToken<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const nativeTokenAddress = useNativeTokenAddress(pluginID, options)
    return useFungibleToken<S, T>(pluginID, nativeTokenAddress, options)
}
