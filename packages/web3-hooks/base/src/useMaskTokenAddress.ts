import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Others } from './useWeb3Others.js'

export function useMaskTokenAddress<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: ConnectionOptions<T>,
) {
    const { chainId } = useChainContext()
    const Others = useWeb3Others(pluginID)
    return Others?.getMaskTokenAddress?.(options?.chainId ?? chainId)
}
