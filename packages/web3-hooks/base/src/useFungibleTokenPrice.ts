import type { NetworkPluginID } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'
import { useQuery } from '@tanstack/react-query'

export function useFungibleTokenPrice<T extends NetworkPluginID = NetworkPluginID>(
    pluginID: T,
    address?: string,
    options?: HubOptions<T>,
) {
    const { chainId } = useChainContext({ chainId: options?.chainId })
    const Hub = useWeb3Hub(pluginID, {
        chainId,
        ...options,
    } as HubOptions<T>)

    return useQuery({
        enabled: !!chainId && !!address,
        queryKey: ['fungible', 'token-price', pluginID, chainId, address, options],
        queryFn: async () => {
            return Hub.getFungibleTokenPrice(chainId, address!.toLowerCase())
        },
    })
}
