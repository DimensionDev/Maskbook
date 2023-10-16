import type { NetworkPluginID } from '@masknet/shared-base'
import { getRegisteredWeb3Chains } from '@masknet/web3-providers'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useNetworkContext } from './useContext.js'

export function useChainDescriptor<T extends NetworkPluginID>(
    expectedPluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const { pluginID } = useNetworkContext(expectedPluginID)
    const { chainId } = useChainContext()

    return getRegisteredWeb3Chains(pluginID).find((x) => x.chainId === (expectedChainId ?? chainId))
}
