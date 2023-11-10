import { useAsyncRetry } from 'react-use'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from './useContext.js'
import { useWeb3State } from './useWeb3State.js'
import { useWeb3Utils } from './useWeb3Utils.js'

export function useLookupAddress<T extends NetworkPluginID>(
    pluginID?: T,
    domain?: string | null,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const { chainId } = useChainContext({ chainId: expectedChainId })
    const Utils = useWeb3Utils(pluginID)
    const { NameService } = useWeb3State(pluginID)

    return useAsyncRetry(async () => {
        if (!domain || !Utils.isValidDomain(domain) || !NameService) return
        return NameService.lookup?.(domain)
    }, [chainId, domain, NameService, Utils])
}
