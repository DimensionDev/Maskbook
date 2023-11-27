import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { RSS3 } from '@masknet/web3-providers'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { RSS3BaseAPI } from '@masknet/web3-providers/types'

export function useFeeds(address?: string, tag?: RSS3BaseAPI.Tag) {
    const response = useInfiniteQuery({
        enabled: !!address,
        queryKey: ['rss3-feeds', address, tag],
        queryFn: async ({ pageParam }) => {
            const res = await RSS3.getAllNotes(address!, { tag }, { indicator: pageParam, size: 20 })
            return res
        },
        getNextPageParam: (lastPage) => lastPage?.nextIndicator,
    })

    const pages = response.data?.pages
    const feeds = useMemo(() => {
        if (!pages) return EMPTY_LIST
        return pages.flatMap((page) => page.data)
    }, [pages])

    return [feeds, response] as const
}
