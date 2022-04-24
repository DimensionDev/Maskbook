import type { Web3Helper } from '../web3-helpers'
import type { NetworkPluginID } from '../web3-types'
import { useChainDetailed } from './useChainDetailed'

export function useChainIdMatched<T extends NetworkPluginID>(
    pluginID?: T,
    chainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const chainDetailed = useChainDetailed(pluginID, chainId)

    if (!chainId || !chainDetailed) return false
    return chainDetailed?.chainId === chainId
}
