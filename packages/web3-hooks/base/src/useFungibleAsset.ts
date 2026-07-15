import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useQuery } from '@tanstack/react-query'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useFungibleAsset<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: ConnectionOptions<T>,
) {
    const Hub = useWeb3Hub(pluginID, options)

    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    return useQuery<Web3Helper.FungibleAssetScope<S, T> | null>({
        enabled: !!address,
        queryKey: ['fungible-asset', pluginID, address, options],
        queryFn: async () => {
            if (!address) return null
            return (await Hub.getFungibleAsset(address, options)) || null
        },
    })
}
