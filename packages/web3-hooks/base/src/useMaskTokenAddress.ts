import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Utils } from './useWeb3Utils.js'

export function useMaskTokenAddress<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: ConnectionOptions<T>,
) {
    const { chainId } = useChainContext()
    const Utils = useWeb3Utils(pluginID)
    return Utils?.getMaskTokenAddress?.(options?.chainId ?? chainId)
}
