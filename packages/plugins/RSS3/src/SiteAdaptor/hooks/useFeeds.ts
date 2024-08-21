import { skipToken, useInfiniteQuery } from '@tanstack/react-query'
import { RSS3 } from '@masknet/web3-providers'
import { EMPTY_LIST } from '@masknet/shared-base'

export function useFeeds(address: string | undefined, options?: Partial<Record<string, string | string[]>>) {
    return useInfiniteQuery({
        initialPageParam: undefined as any,
        queryKey: ['rss3-feeds', address, options],
        queryFn:
            address ?
                async ({ pageParam }) => {
                    return RSS3.getAllNotes(address, options, { indicator: pageParam, size: 20 })
                }
            :   skipToken,
        getNextPageParam: (lastPage) => lastPage?.nextIndicator,
        select: (data) => data.pages.flatMap((page) => page.data) || EMPTY_LIST,
    })
}
