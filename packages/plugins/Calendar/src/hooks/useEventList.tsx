import { EMPTY_OBJECT } from '@masknet/shared-base'
import { Calendar } from '@masknet/web3-providers'
import type { ParsedEvent } from '@masknet/web3-providers/types'
import { useQuery } from '@tanstack/react-query'
import { addDays, startOfMonth } from 'date-fns'

export function useNewsList(date: Date) {
    const startTime = startOfMonth(date).getTime()
    const endTime = addDays(date, 45).getTime()
    return useQuery({
        queryKey: ['newsList', startTime, endTime],
        queryFn: async () => Calendar.getNewsList(startTime, endTime),
        select(data) {
            if (!data) return EMPTY_OBJECT
            return data.reduce((acc: Record<string, ParsedEvent[]>, v) => {
                const date = new Date(v.event_date).toLocaleDateString()
                acc[date] = acc[date] || []
                acc[date].push(v)
                return acc
            }, {})
        },
    })
}
