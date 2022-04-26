import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State'

export function useDefaultChainId<T extends NetworkPluginID>(pluginID?: T) {
    const { Others } = useWeb3State(pluginID)
    const chainId = Others?.getDefaultChainId()

    if (!chainId) throw new Error('No default chain id.')
    return chainId
}
