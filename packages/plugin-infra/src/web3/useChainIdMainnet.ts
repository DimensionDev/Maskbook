import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'

export function useChainIdMainnet<T extends NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const chainId = useChainId(pluginID, expectedChainId)
    const { Others } = useWeb3State(pluginID)
    return Others?.chainResolver.isMainnet?.(chainId) ?? false
}
