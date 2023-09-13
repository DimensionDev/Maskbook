import { useQuery } from '@tanstack/react-query'
import { Calendar } from '@masknet/web3-providers'

export function useNewsList() {
    const date = Math.floor(Number(Date.now()) / 1000)
    const { data, isLoading } = useQuery(
        ['newsList', Math.floor(date / 1000)],
        async () => await Calendar.getNewsList(date),
    )
    const eventsWithDate: Record<string, any[]> = {}
    const eventList = data?.data?.events
    eventList?.map((v: any) => {
        const date = new Date(Number(v.event_date) * 1000).toLocaleDateString()
        if (!eventsWithDate[date]) eventsWithDate[date] = []
        eventsWithDate[date].push(v)
    })
    return { data: eventsWithDate, isLoading }
}

export function useEventList() {
    const date = Math.floor(Number(Date.now()) / 1000)
    const { data, isLoading } = useQuery(
        ['eventList', Math.floor(date / 1000)],
        async () => await Calendar.getEventList(date),
    )
    const eventsWithDate: Record<string, any[]> = {}
    const eventList = data?.data?.events
    eventList?.map((v: any) => {
        const date = new Date(Number(v.event_date) * 1000).toLocaleDateString()
        if (!eventsWithDate[date]) eventsWithDate[date] = []
        eventsWithDate[date].push(v)
    })
    return { data: eventsWithDate, isLoading }
}

export function useNFTList() {
    const date = Math.floor(Number(Date.now()) / 1000)
    const { data, isLoading } = useQuery(
        ['nftList', Math.floor(date / 1000)],
        async () => await Calendar.getNFTList(date),
    )
    const eventsWithDate: Record<string, any[]> = {}
    const eventList = data?.data?.events
    eventList?.map((v: any) => {
        const date = new Date(Number(v.event_date) * 1000).toLocaleDateString()
        if (!eventsWithDate[date]) eventsWithDate[date] = []
        eventsWithDate[date].push(v)
    })
    return { data: eventsWithDate, isLoading }
}
