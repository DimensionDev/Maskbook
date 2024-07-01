import { useQuery } from '@tanstack/react-query'
import { Calendar } from '@masknet/web3-providers'
import { startOfMonth, endOfMonth, addDays } from 'date-fns'
import { EMPTY_OBJECT } from '@masknet/shared-base'
import type { UseQueryResult } from '@tanstack/react-query'

export function useNewsList(date: Date): UseQueryResult<any> {
    const startTime = startOfMonth(date).getTime() / 1000
    const endTime = Math.floor(addDays(date, 45).getTime() / 1000)
    return useQuery({
        queryKey: ['newsList', startTime, endTime],
        queryFn: async () => Calendar.getNewsList(startTime, endTime),
        select(data) {
            return (
                data?.reduce((acc: Record<string, any[]>, v: any) => {
                    const date = new Date(Number(v.event_date)).toLocaleDateString()
                    acc[date] = acc[date] || []
                    acc[date].push(v)
                    return acc
                }, {}) ?? EMPTY_OBJECT
            )
        },
    })
}

export function useEventList(date: Date) {
    const startTime = startOfMonth(date).getTime() / 1000
    const endTime = Math.floor(addDays(date, 45).getTime() / 1000)
    return useQuery<any>({
        queryKey: ['eventList', startTime, endTime],
        queryFn: async () => Calendar.getEventList(startTime, endTime),
        select(data) {
            return (
                data?.reduce((acc: Record<string, any[]>, v: any) => {
                    const date = new Date(Number(v.event_date)).toLocaleDateString()
                    acc[date] = acc[date] || []
                    acc[date].push(v)
                    return acc
                }, {}) ?? EMPTY_OBJECT
            )
        },
    })
}

export function useNFTList(date: Date) {
    const startTime = startOfMonth(date).getTime() / 1000
    const endTime = Math.floor(endOfMonth(date).getTime() / 1000)
    return useQuery<any>({
        queryKey: ['nftList', startTime, endTime],
        queryFn: async () => Calendar.getNFTList(startTime, endTime),
        select(data) {
            return (
                data?.reduce((acc: Record<string, any[]>, v: any) => {
                    const date = new Date(v.event_date).toLocaleDateString()
                    acc[date] = acc[date] || []
                    acc[date].push(v)
                    return acc
                }, {}) ?? EMPTY_OBJECT
            )
        },
    })
}
