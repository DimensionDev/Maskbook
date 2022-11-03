import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3State } from './useWeb3State.js'

export function useChainColor<T extends NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const { chainId } = useChainContext({ chainId: expectedChainId })
    const { Others } = useWeb3State(pluginID)

    return Others?.chainResolver.chainColor?.(chainId) ?? 'transparent'
}
