import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId } from './useChainId.js'
import { useWeb3State } from './useWeb3State.js'
import type { Web3Helper } from '../web3-helpers/index.js'

export function useChainIdSupport<T extends NetworkPluginID>(
    pluginID?: T,
    feature?: string,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const chainId = useChainId(pluginID, expectedChainId)
    const { Others } = useWeb3State(pluginID)

    return Others?.chainResolver.isSupport?.(chainId, feature) ?? false
}
