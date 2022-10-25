import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'

export function useChainIdMatched<T extends NetworkPluginID>(expectedChainId?: Web3Helper.Definition[T]['ChainId']) {
    const { chainId: actualChainId } = useChainContext<T>()
    return actualChainId === expectedChainId
}
