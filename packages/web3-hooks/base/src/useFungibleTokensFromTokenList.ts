import type { NetworkPluginID } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-providers/types'
import type { UseQueryResult } from '@tanstack/react-query'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'
import { useQuery } from '@tanstack/react-query'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useFungibleTokensFromTokenList<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: HubOptions<T>,
): UseQueryResult<Array<FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>> {
    const { chainId } = useChainContext({ chainId: options?.chainId })
    const Hub = useWeb3Hub(pluginID, {
        chainId,
        ...options,
    } as HubOptions<T>)
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    return useQuery({
        queryKey: ['get-fungible-tokens', 'from-token-list', chainId, options],
        queryFn: async () => {
            return Hub.getFungibleTokensFromTokenList(chainId, { chainId })
        },
    })
}
