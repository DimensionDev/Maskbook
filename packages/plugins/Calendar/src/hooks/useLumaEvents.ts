import { Calendar } from '@masknet/web3-providers'
import { useInfiniteQuery } from '@tanstack/react-query'
import { addDays, startOfMonth } from 'date-fns'
import { useEffect } from 'react'

export function useLumaEvents(date: Date, enabled = true) {
    const startTime = startOfMonth(date).getTime()
    const endTime = addDays(startTime, 45).getTime()
    const query = useInfiniteQuery({
        enabled,
        queryKey: ['lumaEvents', startTime, endTime],
        initialPageParam: undefined as any,
        queryFn: async ({ pageParam }) => Calendar.getEventList(startTime, endTime, pageParam),
        getNextPageParam(page) {
            return page.nextIndicator
        },
        select(data) {
            return data.pages.flatMap((x) => x.data)
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
