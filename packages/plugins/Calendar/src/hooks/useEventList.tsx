import { useQuery } from '@tanstack/react-query'
import { Calendar } from '@masknet/web3-providers'

export function useNewsList() {
    const date = Math.floor(Date.now() / 1000)
    const { data, isLoading } = useQuery<any>(
        ['newsList', Math.floor(date / 1000)],
        async () => await Calendar.getNewsList(date),
    )
    const eventsWithDate: Record<string, any[]> =
        data?.data?.events.reduce((acc: Record<string, any[]>, v: any) => {
            const date = new Date(Number(v.event_date) * 1000).toLocaleDateString()
            acc[date] = acc[date] || []
            acc[date].push(v)
            return acc
        }, {}) ?? {}
    return { data: eventsWithDate, isLoading }
}

export function useEventList() {
    const date = Math.floor(Date.now() / 1000)
    const { data, isLoading } = useQuery<any>(
        ['eventList', Math.floor(date / 1000)],
        async () => await Calendar.getEventList(date),
    )
    const eventsWithDate: Record<string, any[]> =
        data?.data?.events.reduce((acc: Record<string, any[]>, v: any) => {
            const date = new Date(Number(v.event_date) * 1000).toLocaleDateString()
            acc[date] = acc[date] || []
            acc[date].push(v)
            return acc
        }, {}) ?? {}
    return { data: eventsWithDate, isLoading }
}

export function useNFTList() {
    const date = Math.floor(Date.now() / 1000)
    const { data, isLoading } = useQuery<any>(
        ['nftList', Math.floor(date / 1000)],
        async () => await Calendar.getNFTList(date),
    )
    const eventsWithDate: Record<string, any[]> =
        data?.data?.events.reduce((acc: Record<string, any[]>, v: any) => {
            const date = new Date(Number(v.event_date) * 1000).toLocaleDateString()
            acc[date] = acc[date] || []
            acc[date].push(v)
            return acc
        }, {}) ?? {}
    return { data: eventsWithDate, isLoading }
}
