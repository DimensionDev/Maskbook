import type { Web3Helper } from '../web3-helpers'
import type { NetworkPluginID } from '../web3-types'
import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'

export function useChainDetailed<T extends NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const chainId = useChainId(pluginID, expectedChainId)
    const { Utils } = useWeb3State(pluginID)

    // @ts-ignore
    return Utils?.getChainDetailed?.(chainId) ?? null
}
