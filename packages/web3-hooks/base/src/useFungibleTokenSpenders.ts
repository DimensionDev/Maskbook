import { useQuery } from '@tanstack/react-query'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useFungibleTokenSpenders<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: HubOptions<T>,
) {
    const { account, chainId } = useChainContext<T>({
        account: options?.account,
        chainId: options?.chainId,
    })
    const Hub = useWeb3Hub(pluginID, {
        account,
        chainId,
        ...options,
    } as HubOptions<T>)
    return useQuery({
        queryKey: ['fungible-tokens', 'spenders', chainId, account],
        enabled: true,
        queryFn: async () => Hub.getFungibleTokenSpenders(chainId, account),
    })
}
