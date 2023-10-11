import { type NetworkPluginID } from '@masknet/shared-base'
import { useNetworkContext } from './useContext.js'
import { getRegisteredWeb3Providers } from '@masknet/web3-providers'

export function useProviderDescriptors<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
) {
    const { pluginID } = useNetworkContext(expectedPluginID)

    return getRegisteredWeb3Providers(pluginID)
}
