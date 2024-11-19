import { createNextIndicator, createPageable, type PageIndicator } from '@masknet/shared-base'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import urlcat from 'urlcat'
import type { GetEventResponse } from '../types/Luma.js'

export class Luma {
    static async getEvents(indicator?: PageIndicator, size = 10) {
        const url = urlcat('https://api.lu.ma/discover/category/get-events', {
            slug: 'crypto',
            // global events
            south: -90,
            north: 90,
            west: 0,
            east: 360,
            pagination_limit: size,
            pagination_cursor: indicator?.id,
        })
        const res = await fetchJSON<GetEventResponse>(url)
        if (!res?.entries.length) {
            return createPageable([], indicator, createNextIndicator(indicator))
        }
        res.entries.forEach((entry) => {
            entry.event.url = `https://lu.ma/${entry.event.url}`
        })
        return createPageable(res.entries, indicator, createNextIndicator(indicator, res.next_cursor))
    }
}
