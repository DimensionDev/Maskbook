import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainId } from './useChainId.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useFungibleTokenPrice<T extends NetworkPluginID>(
    pluginID: T,
    address?: string,
    options?: Web3Helper.Web3HubOptions<T>,
) {
    const chainId = useChainId(pluginID, options?.chainId)
    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry(async () => {
        if (!chainId || !hub) return 0
        return hub.getFungibleTokenPrice?.(chainId, address ?? '')
    }, [chainId, address, hub])
}
