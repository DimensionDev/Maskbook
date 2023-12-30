import { type NetworkPluginID } from '@masknet/shared-base'
import { getRegisteredWeb3Networks } from '@masknet/web3-providers'
import { useNetworkContext } from './useContext.js'

/**
 * Get all built in declared network descriptor
 * @param expectedPluginID
 * @param expectedChainIdOrNetworkTypeOrID
 * @returns
 */
export function useNetworkDescriptors<T extends NetworkPluginID = NetworkPluginID>(expectedPluginID?: T) {
    const { pluginID } = useNetworkContext(expectedPluginID)
    return getRegisteredWeb3Networks(pluginID)
}
