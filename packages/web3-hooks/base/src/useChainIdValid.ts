import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3Others } from './useWeb3Others.js'

export function useChainIdValid<T extends NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const { account, chainId } = useChainContext({ chainId: expectedChainId })
    const Others = useWeb3Others(pluginID)

    return (!account || Others.chainResolver.isValid(chainId, process.env.NODE_ENV === 'development')) ?? false
}
