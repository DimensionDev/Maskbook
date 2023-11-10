import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3Utils } from './useWeb3Utils.js'

export function useChainIdValid<T extends NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const { account, chainId } = useChainContext({ chainId: expectedChainId })
    const Utils = useWeb3Utils(pluginID)

    return (!account || Utils.chainResolver.isValidChainId?.(chainId, process.env.NODE_ENV === 'development')) ?? false
}
