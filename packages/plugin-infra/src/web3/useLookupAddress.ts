import { useAsyncRetry } from 'react-use'
import type { Web3Helper } from '../web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId } from './useChainId.js'
import { useWeb3State } from './useWeb3State.js'

export function useLookupAddress<T extends NetworkPluginID>(
    pluginId?: T,
    domain?: string,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const chainId = useChainId(pluginId, expectedChainId)
    const { NameService, Others } = useWeb3State(pluginId)

    return useAsyncRetry(async () => {
        if (!chainId || !domain || !Others?.isValidDomain?.(domain) || !NameService) return
        return NameService.lookup?.(chainId, domain)
    }, [chainId, domain, NameService, Others])
}
