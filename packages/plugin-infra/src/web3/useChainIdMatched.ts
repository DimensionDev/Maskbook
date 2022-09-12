import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers/index.js'
import { useChainId } from './useChainId.js'

export function useChainIdMatched<T extends NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const actualChainId = useChainId(pluginID)
    return actualChainId === expectedChainId
}
