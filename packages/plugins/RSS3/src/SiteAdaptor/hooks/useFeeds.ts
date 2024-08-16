import { useInfiniteQuery } from '@tanstack/react-query'
import { RSS3 } from '@masknet/web3-providers'
import { EMPTY_LIST } from '@masknet/shared-base'

export function useFeeds(address: string | undefined, options?: Partial<Record<string, string | string[]>>) {
    return useInfiniteQuery({
        enabled: !!address,
        initialPageParam: undefined as any,
        queryKey: ['rss3-feeds', address, options],
        queryFn: async ({ pageParam }) => {
            const res = await RSS3.getAllNotes(address!, options, {
                indicator: pageParam,
                size: 20,
            })
            return res
        },
        getNextPageParam: (lastPage) => lastPage?.nextIndicator,
        select: (data) => data.pages.flatMap((page) => page.data) || EMPTY_LIST,
    })
}
