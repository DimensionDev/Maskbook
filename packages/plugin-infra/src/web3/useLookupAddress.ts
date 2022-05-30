import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'
import type { Web3Helper } from '../web3-helpers'

export function useLookupAddress<T extends NetworkPluginID>(pluginId?: T, domain?: string) {
    type LookupDomain = (chainId: Web3Helper.Definition[T]['ChainId'], domain?: string) => Promise<string | undefined>

    const chainId = useChainId(pluginId)
    const { NameService, Others } = useWeb3State(pluginId)

    return useAsyncRetry(async () => {
        if (!chainId || !Others?.isValidDomain?.(domain) || !NameService) return
        return (NameService.lookup as LookupDomain)(chainId, domain)
    }, [chainId, domain, NameService, Others])
}
