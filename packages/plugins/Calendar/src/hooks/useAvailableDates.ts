import { Calendar } from '@masknet/web3-providers'
import { type EventProvider } from '@masknet/web3-providers/types'
import { useQuery } from '@tanstack/react-query'
import { startOfMonth, addDays, format } from 'date-fns'

export function useAvailableDates(type: EventProvider, date: Date, enabled = true) {
    const startTime = startOfMonth(date).getTime()
    const endTime = addDays(startTime, 45).getTime()
    return useQuery({
        enabled,
        queryKey: ['available-dates', type, startTime, endTime],
        queryFn: () => Calendar.getAvailableDates(type, startTime, endTime),
        select(dates) {
            return dates.map((date) => format(date, 'MM/dd/yyyy'))
        },
    })
}
