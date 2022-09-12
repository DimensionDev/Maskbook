import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId } from './useChainId.js'
import { useWeb3State } from './useWeb3State.js'
import { useAccount } from './useAccount.js'
import type { Web3Helper } from '../web3-helpers/index.js'

export function useChainIdValid<T extends NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const chainId = useChainId(pluginID, expectedChainId)
    const account = useAccount(pluginID)
    const { Others } = useWeb3State(pluginID)

    return (!account || Others?.chainResolver.isValid?.(chainId, process.env.NODE_ENV === 'development')) ?? false
}
