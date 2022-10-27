import { useAsyncRetry } from 'react-use'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'
import { isUndefined } from 'lodash-unified'
import { useChainContext } from './useContext.js'
import { useWeb3State } from './useWeb3State.js'

export function useLookupAddress<T extends NetworkPluginID>(
    pluginID?: T,
    domain?: string,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const { chainId } = useChainContext({ chainId: expectedChainId })
    const { NameService, Others } = useWeb3State(pluginID)

    return useAsyncRetry(async () => {
        if (isUndefined(chainId) || !domain || !Others?.isValidDomain?.(domain) || !NameService) return
        return NameService.lookup?.(chainId, domain)
    }, [chainId, domain, NameService, Others])
}
