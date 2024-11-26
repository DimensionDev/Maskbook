import { Calendar } from '@masknet/web3-providers'
import { useInfiniteQuery } from '@tanstack/react-query'
import { addDays, startOfMonth } from 'date-fns'
import { uniqBy } from 'lodash-es'
import { useEffect } from 'react'

export function useNewsList(date: Date, enabled = true) {
    const startTime = startOfMonth(date).getTime()
    const endTime = addDays(startTime, 45).getTime()

    const query = useInfiniteQuery({
        enabled,
        queryKey: ['newsList', startTime, endTime],
        queryFn: async ({ pageParam }) => Calendar.getNewsList(startTime, endTime, pageParam),
        initialPageParam: undefined as any,
        getNextPageParam: (page) => page.nextIndicator,
        select(data) {
            return uniqBy(
                data.pages.flatMap((x) => x.data),
                (x) => x.event_id,
            )
        },
    })

    const { hasNextPage, isFetchingNextPage, fetchNextPage } = query
    useEffect(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    return query
}
