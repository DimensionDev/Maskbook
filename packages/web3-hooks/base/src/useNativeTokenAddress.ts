import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useWeb3Utils } from './useWeb3Utils.js'
import { useNetwork } from './useNetwork.js'

export function useNativeTokenAddress<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: ConnectionOptions<T>,
) {
    const network = useNetwork(pluginID)
    const Utils = useWeb3Utils(pluginID)
    if (network?.isCustomized) {
        return network.nativeCurrency.address
    }
    return Utils.getNativeTokenAddress(options?.chainId)
}
