import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'

export function useLookupAddress<T extends NetworkPluginID>(pluginId?: T, domain?: string) {
    const chainId = useChainId(pluginId)
    const { NameService, Others } = useWeb3State(pluginId)

    return useAsyncRetry(async () => {
        if (!chainId || !domain || !Others?.isValidDomain?.(domain) || !NameService) return
        return NameService.lookup?.(chainId, domain)
    }, [chainId, domain, NameService, Others])
}
