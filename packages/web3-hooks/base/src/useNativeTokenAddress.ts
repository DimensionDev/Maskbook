import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useWeb3Others } from './useWeb3Others.js'
import { useNetwork } from './useNetwork.js'

export function useNativeTokenAddress<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: ConnectionOptions<T>,
) {
    const network = useNetwork(pluginID)
    const Others = useWeb3Others(pluginID)
    if (network?.isCustomized) {
        return network.nativeCurrency.address
    }
    return Others.getNativeTokenAddress(options?.chainId)
}
