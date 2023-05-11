import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { compact } from 'lodash-es'
import { RSS3 } from '@masknet/web3-providers'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { RSS3BaseAPI } from '@masknet/web3-providers/types'

export function useFeeds(address?: string, tag?: RSS3BaseAPI.Tag) {
    const { data, isLoading, error, hasNextPage, fetchNextPage } = useInfiniteQuery({
        queryKey: ['rss3-feeds', address, tag],
        queryFn: async ({ pageParam }) => {
            if (!address) return
            const res = await RSS3.getAllNotes(address, { tag }, { indicator: pageParam, size: 20 })
            return res
        },
        getNextPageParam: (lastPage) => lastPage?.nextIndicator,
    })

    const feeds = useMemo(() => {
        if (!data?.pages) return EMPTY_LIST
        return compact(data.pages).flatMap((page) => page.data)
    }, [data?.pages])

    return {
        feeds,
        loading: isLoading,
        error: error as Error | undefined,
        finished: !hasNextPage,
        next: fetchNextPage,
    }
}
