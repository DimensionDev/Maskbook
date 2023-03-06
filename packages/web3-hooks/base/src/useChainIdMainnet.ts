import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3State } from './useWeb3State.js'

export function useChainIdMainnet<T extends NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const { chainId } = useChainContext({ chainId: expectedChainId })
    const { Others } = useWeb3State(pluginID)
    return Others?.chainResolver.isMainnet?.(chainId) ?? false
}
