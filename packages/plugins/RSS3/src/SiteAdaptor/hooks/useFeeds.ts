import { useInfiniteQuery } from '@tanstack/react-query'
import { RSS3 } from '@masknet/web3-providers'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { RSS3BaseAPI } from '@masknet/web3-providers/types'

export function useFeeds(address?: string, tags?: RSS3BaseAPI.Tag[]) {
    return useInfiniteQuery({
        enabled: !!address,
        initialPageParam: undefined as any,
        queryKey: ['rss3-feeds', address, tags],
        queryFn: async ({ pageParam }) => {
            const res = await RSS3.getAllNotes(address!, { tag: tags }, { indicator: pageParam, size: 20 })
            return res
        },
        getNextPageParam: (lastPage) => lastPage?.nextIndicator,
        select: (data) => data.pages.flatMap((page) => page.data) || EMPTY_LIST,
    })
}
