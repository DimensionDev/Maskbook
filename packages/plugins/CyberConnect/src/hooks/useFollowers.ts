import type { PageIndicator } from '@masknet/shared-base'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { ProfileTab } from '../constants.js'
import { PluginCyberConnectRPC } from '../messages.js'

export function useFollowers(tab: ProfileTab, address?: string, size = 50) {
    return useInfiniteQuery({
        queryKey: ['cyber-connect', 'followers', tab, address, size],
        initialPageParam: undefined as PageIndicator | undefined,
        queryFn: async ({ pageParam }) => {
            if (!address) return
            return PluginCyberConnectRPC.fetchFollowers(tab, address, size, pageParam)
        },
        getNextPageParam: (lastPage) => lastPage?.nextIndicator as PageIndicator | undefined,
    })
}
