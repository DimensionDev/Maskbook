import type { NetworkPluginID } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'
import { useQuery } from '@tanstack/react-query'

export function useFungibleTokensFromTokenList<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: HubOptions<T>,
) {
    const { chainId } = useChainContext({ chainId: options?.chainId })
    const Hub = useWeb3Hub(pluginID, {
        chainId,
        ...options,
    } as HubOptions<T>)

    return useQuery({
        queryKey: ['get-fungible-tokens', 'from-token-list', chainId, options],
        queryFn: async () => {
            return Hub.getFungibleTokensFromTokenList(chainId, { chainId })
        },
    })
}
