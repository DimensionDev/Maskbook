import type { PageIndicator } from '@masknet/shared-base'
import { Calendar } from '@masknet/web3-providers'
import { useInfiniteQuery } from '@tanstack/react-query'
import { addDays, startOfDay } from 'date-fns'
import { uniqBy } from 'lodash-es'

export function useNewsList(date: Date) {
    const startTime = startOfDay(date).getTime()
    const endTime = addDays(startTime, 14).getTime()

    return useInfiniteQuery({
        queryKey: ['newsList', startTime, endTime],
        queryFn: async ({ pageParam }) => Calendar.getNewsList(startTime, endTime, pageParam),
        initialPageParam: undefined as PageIndicator | undefined,
        getNextPageParam: (page) => page.nextIndicator,
        select(data) {
            return uniqBy(
                data.pages.flatMap((x) => x.data),
                (x) => x.event_id,
            )
        },
    })
}
