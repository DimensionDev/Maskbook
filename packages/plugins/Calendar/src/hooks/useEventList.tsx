import { useQuery } from '@tanstack/react-query'
import { Calendar } from '@masknet/web3-providers'
import { startOfMonth, endOfMonth } from 'date-fns'
import { EMPTY_OBJECT } from '@masknet/shared-base'
import type { UseQueryResult } from '@tanstack/react-query'
import { addDays } from 'date-fns/esm'

export function useNewsList(date: Date, enabled = true): UseQueryResult<any> {
    const startTime = startOfMonth(date).getTime() / 1000
    const endTime = Math.floor(addDays(date, 45).getTime() / 1000)
    return useQuery({
        enabled,
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

export function useEventList(date: Date, enabled = true) {
    const startTime = startOfMonth(date).getTime() / 1000
    const endTime = Math.floor(addDays(date, 45).getTime() / 1000)
    return useQuery<any>({
        enabled,
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

export function useNFTList(date: Date, enabled = true) {
    const startTime = startOfMonth(date).getTime() / 1000
    const endTime = Math.floor(endOfMonth(date).getTime() / 1000)
    return useQuery<any>({
        enabled,
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
