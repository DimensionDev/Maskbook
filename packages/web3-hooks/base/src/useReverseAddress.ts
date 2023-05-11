import { useQuery } from '@tanstack/react-query'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

export function useReverseAddress<T extends NetworkPluginID>(pluginID?: T, address?: string) {
    const { NameService, Others } = useWeb3State(pluginID)

    const isBad = !address || !Others?.isValidAddress?.(address) || Others.isZeroAddress?.(address) || !NameService
    return useQuery<string | undefined>({
        queryKey: ['reverse', address],
        enabled: !isBad,
        queryFn: async () => {
            if (isBad) return
            return NameService.reverse?.(address)
        },
    })
}
