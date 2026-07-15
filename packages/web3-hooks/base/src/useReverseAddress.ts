import type { NameServiceID, NetworkPluginID } from '@masknet/shared-base'
import { useNetworkContext } from '@masknet/web3-hooks-base'
import { getActivatedPluginWeb3State } from '@masknet/web3-providers'
import { useQueries, useQuery } from '@tanstack/react-query'

export function useReverseAddress(
    expectedPluginID?: NetworkPluginID,
    address?: string,
    domainOnly?: boolean,
    preferredType?: NameServiceID,
) {
    const { pluginID } = useNetworkContext(expectedPluginID)
    return useQuery({
        queryKey: ['reverse', address, pluginID, domainOnly, preferredType],
        queryFn: async () => {
            const { NameService } = getActivatedPluginWeb3State(pluginID)
            if (!address || !NameService) return null
            return (await NameService?.reverse?.(address, domainOnly)) || null
        },
    })
}

export function useReverseAddresses(
    addresses: Array<{ address: string; pluginID: NetworkPluginID }>,
    domainOnly?: boolean,
    preferredType?: NameServiceID,
) {
    return useQueries({
        queries: addresses.map(({ address, pluginID }) => ({
            queryKey: ['reverse', address, pluginID, domainOnly, preferredType],
            queryFn: async () => {
                const { NameService } = getActivatedPluginWeb3State(pluginID)
                if (!address || !NameService) return null
                return (await NameService?.reverse?.(address, domainOnly)) || null
            },
        })),
    })
}
