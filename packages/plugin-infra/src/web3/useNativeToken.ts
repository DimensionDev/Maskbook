import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useFungibleToken } from './useFungibleToken'
import { useNativeTokenAddress } from './useNativeTokenAddress'

export function useNativeToken<T extends NetworkPluginID>(pluginID: T, options?: Web3Helper.Web3ConnectionOptions<T>) {
    const nativeTokenAddress = useNativeTokenAddress(pluginID, options)
    return useFungibleToken(pluginID, nativeTokenAddress, options)
}
