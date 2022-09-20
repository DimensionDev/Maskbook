import { useAsyncRetry } from 'react-use'
import { useWeb3 } from './useWeb3.js'
import type { Web3Helper } from '../web3-helpers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId } from './useChainId.js'
import { useWeb3State } from './useWeb3State.js'

export function useLookupAddress<T extends NetworkPluginID>(
    pluginId?: T,
    domain?: string,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const chainId = useChainId(pluginId, expectedChainId)
    const { NameService, Others } = useWeb3State(pluginId)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)

    return useAsyncRetry(async () => {
        if (!domain || !Others?.isValidDomain?.(domain) || !web3) return
        try {
            if (!chainId || !NameService?.lookup) {
                return web3.eth.ens.registry.getOwner(domain)
            }

            return (await NameService.lookup(chainId, domain)) ?? web3.eth.ens.registry.getOwner(domain)
        } catch {
            return web3.eth.ens.registry.getOwner(domain)
        }
    }, [chainId, domain, NameService, web3, Others])
}
