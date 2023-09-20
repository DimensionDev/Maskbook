import { useQuery } from '@tanstack/react-query'
import { Calendar } from '@masknet/web3-providers'
import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'

export function useNewsList(date: Date) {
    const startTime = startOfMonth(date).getTime() / 1000
    const endTime = Math.floor(endOfMonth(date).getTime() / 1000)
    const { data, isLoading } = useQuery<any>(
        ['newsList', startTime, endTime],
        async () => await Calendar.getNewsList(startTime, endTime),
    )
    const eventsWithDate: Record<string, any[]> =
        data?.reduce((acc: Record<string, any[]>, v: any) => {
            const date = new Date(Number(v.event_date)).toLocaleDateString()
            acc[date] = acc[date] || []
            acc[date].push(v)
            return acc
        }, {}) ?? {}
    return { data: eventsWithDate, isLoading }
}

export function useEventList(date: Date) {
    const startTime = startOfMonth(date).getTime() / 1000
    const endTime = Math.floor(endOfMonth(date).getTime() / 1000)
    const { data, isLoading } = useQuery<any>(
        ['eventList', startTime, endTime],
        async () => await Calendar.getEventList(startTime, endTime),
    )
    const eventsWithDate: Record<string, any[]> =
        data?.reduce((acc: Record<string, any[]>, v: any) => {
            const date = new Date(Number(v.event_date)).toLocaleDateString()
            acc[date] = acc[date] || []
            acc[date].push(v)
            return acc
        }, {}) ?? {}
    return { data: eventsWithDate, isLoading }
}

export function useNFTList(date: Date) {
    const startTime = startOfMonth(date).getTime() / 1000
    const endTime = Math.floor(endOfMonth(date).getTime() / 1000)
    const { data, isLoading } = useQuery<any>(
        ['nftList', startTime, endTime],
        async () => await Calendar.getNFTList(startTime, endTime),
    )
    const eventsWithDate: Record<string, any[]> =
        data?.reduce((acc: Record<string, any[]>, v: any) => {
            const date = new Date(v.event_date).toLocaleDateString()
            acc[date] = acc[date] || []
            acc[date].push(v)
            return acc
        }, {}) ?? {}
    return { data: eventsWithDate, isLoading }
}
