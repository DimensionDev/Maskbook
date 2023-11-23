import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { HubOptions } from '@masknet/web3-providers/types'
import type { NonFungibleTokenRarity } from '@masknet/web3-shared-base'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useNonFungibleRarity<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    id?: string,
    options?: HubOptions<T>,
): UseQueryResult<NonFungibleTokenRarity<Web3Helper.Definition[T]['ChainId']> | null | undefined> {
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
