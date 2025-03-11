import type { NetworkPluginID } from '@masknet/shared-base'
import { useNetworkContext } from '@masknet/web3-hooks-base'
import { getConnection } from '@masknet/web3-providers'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useQuery } from '@tanstack/react-query'

export function useNonFungibleTokenBalance<T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
    address?: string,
    options?: ConnectionOptions<T>,
) {
    const { pluginID } = useNetworkContext(expectedPluginID)

    return useQuery({
        queryKey: ['non-fungible-token', 'balance', pluginID, address, options],
        queryFn: async () => {
            if (!pluginID || !address) return null
            const Web3 = getConnection(pluginID, options)
            return Web3.getNonFungibleTokenBalance(address, undefined, undefined, {
                chainId: options?.chainId,
                account: options?.account,
            })
        },
    })
}
