import { useQuery } from '@tanstack/react-query'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

export function useReverseAddress<T extends NetworkPluginID>(pluginID?: T, address?: string) {
    const { NameService } = useWeb3State(pluginID)

    return useQuery({
        queryKey: ['reverse', address],
        enabled: !!NameService?.reverse,
        queryFn: async () => {
            if (!address) return null
            return NameService!.reverse!(address) || null
        },
    })
}
