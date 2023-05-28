import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3Others } from './useWeb3Others.js'

export function useChainIdMainnet<T extends NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const { chainId } = useChainContext({ chainId: expectedChainId })
    const Others = useWeb3Others(pluginID)
    return Others.chainResolver.isMainnet?.(chainId) ?? false
}
