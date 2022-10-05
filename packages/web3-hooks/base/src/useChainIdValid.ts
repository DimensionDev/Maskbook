import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useAccount } from './useAccount.js'
import { useChainId } from './useChainId.js'
import { useWeb3State } from './useWeb3State.js'

export function useChainIdValid<T extends NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const chainId = useChainId(pluginID, expectedChainId)
    const account = useAccount(pluginID)
    const { Others } = useWeb3State(pluginID)

    return (!account || Others?.chainResolver.isValid?.(chainId, process.env.NODE_ENV === 'development')) ?? false
}
