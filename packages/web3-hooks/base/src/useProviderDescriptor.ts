import { getRegisteredWeb3Providers } from '@masknet/web3-providers'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useNetworkContext } from './useContext.js'

/**
 * Get built in declared provider descriptor
 * @param expectedPluginID
 * @param expectedProviderTypeOrID
 * @returns
 */
export function useProviderDescriptor<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
    expectedProviderTypeOrID?: string,
): Web3Helper.ProviderDescriptorScope<S, T> | undefined {
    const { pluginID } = useNetworkContext(expectedPluginID)
    const { providerType } = useChainContext()

    const providers = getRegisteredWeb3Providers(pluginID)
    const typeOrId = expectedProviderTypeOrID ?? providerType ?? ''
    return providers.find((x) => [x.type, x.ID].includes(typeOrId))
}
