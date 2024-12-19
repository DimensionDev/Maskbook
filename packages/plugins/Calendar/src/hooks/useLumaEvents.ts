import type { PageIndicator } from '@masknet/shared-base'
import { Calendar } from '@masknet/web3-providers'
import { useInfiniteQuery } from '@tanstack/react-query'
import { addDays, startOfDay } from 'date-fns'

export function useLumaEvents(date: Date) {
    const startTime = startOfDay(date).getTime()
    const endTime = addDays(startTime, 14).getTime()

    return useInfiniteQuery({
        queryKey: ['lumaEvents', startTime, endTime],
        initialPageParam: undefined as PageIndicator | undefined,
        queryFn: async ({ pageParam }) => Calendar.getEventList(startTime, endTime, pageParam),
        getNextPageParam(page) {
            return page.nextIndicator
        },
        select(data) {
            return data.pages.flatMap((x) => x.data)
        },
    })
}
