import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useWeb3Others } from './useWeb3Others.js'

export function useNativeTokenAddress<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: ConnectionOptions<T>,
) {
    const Others = useWeb3Others(pluginID)
    return Others.getNativeTokenAddress(options?.chainId)
}
