import { useQuery } from '@tanstack/react-query'
import { Calendar } from '@masknet/web3-providers'
import startOfMonth from 'date-fns/startOfMonth'

export function useNewsList() {
    const start = startOfMonth(new Date())
    const date = start.getTime() / 1000
    const { data, isLoading } = useQuery<any>(
        ['newsList', Math.floor(date / 1000)],
        async () => await Calendar.getNewsList(date),
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

export function useEventList() {
    const start = startOfMonth(new Date())
    const date = start.getTime() / 1000
    const { data, isLoading } = useQuery<any>(
        ['eventList', Math.floor(date / 1000)],
        async () => await Calendar.getEventList(date),
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

export function useNFTList() {
    const start = startOfMonth(new Date())
    const date = start.getTime() / 1000
    const { data, isLoading } = useQuery<any>(
        ['nftList', Math.floor(date / 1000)],
        async () => await Calendar.getNFTList(date),
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
