import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainId } from './useChainId.js'
import { useWeb3State } from './useWeb3State.js'

export function useChainIdSupport<T extends NetworkPluginID>(
    pluginID?: T,
    feature?: string,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const chainId = useChainId(pluginID, expectedChainId)
    const { Others } = useWeb3State(pluginID)

    return Others?.chainResolver.isSupport?.(chainId, feature) ?? false
}
