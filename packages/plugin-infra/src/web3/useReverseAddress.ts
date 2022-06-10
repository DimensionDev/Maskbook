import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'

export function useReverseAddress<T extends NetworkPluginID>(pluginID?: T, address?: string) {
    const chainId = useChainId(pluginID)
    const { NameService, Others } = useWeb3State(pluginID)

    return useAsyncRetry(async () => {
        if (!chainId || !address || !Others?.isValidAddress?.(address) || !NameService) return
        return NameService.reverse?.(chainId, address)
    }, [address, chainId, NameService])
}
