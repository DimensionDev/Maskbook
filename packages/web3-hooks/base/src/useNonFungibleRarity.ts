import type { NetworkPluginID } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useQuery } from '@tanstack/react-query'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useNonFungibleRarity<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    id?: string,
    options?: HubOptions<T>,
) {
    const { account } = useChainContext({ account: options?.account })
    const Hub = useWeb3Hub(pluginID, {
        account,
        ...options,
    } as HubOptions<T>)

    return useQuery({
        queryKey: ['non-fungible-rarity', pluginID, address, id, options],
        queryFn: () => {
            // Solana only needs id
            if (!address && !id) return null
            return Hub.getNonFungibleRarity(address || '', id || '')
        },
    })
}
