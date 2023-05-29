import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useFungibleTokenPrice<T extends NetworkPluginID = NetworkPluginID>(
    pluginID: T,
    address?: string,
    options?: HubOptions<T>,
) {
    const { chainId } = useChainContext({ chainId: options?.chainId })
    const Hub = useWeb3Hub(pluginID, {
        chainId,
        ...options,
    })

    return useAsyncRetry(async () => {
        if (!chainId || !address) return 0
        return Hub.getFungibleTokenPrice(chainId, address.toLowerCase())
    }, [chainId, address, Hub])
}
