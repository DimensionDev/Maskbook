import { useWeb3State, useChainId, Web3Helper } from '../entry-web3'
import type { NetworkPluginID } from '../web3-types'

export function useChainColor<T extends NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const chainId = useChainId(pluginID, expectedChainId)
    const { Utils } = useWeb3State(pluginID)

    // @ts-ignore
    return Utils?.resolveChainColor?.(chainId)
}
