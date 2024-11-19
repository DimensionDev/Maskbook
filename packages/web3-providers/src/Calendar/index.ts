import { createNextIndicator, createPageable, type PageIndicator } from '@masknet/shared-base'
import urlcat from 'urlcat'
import { fetchCachedJSON } from '../entry-helpers.js'
import type { EventResponse } from './types.js'

const BASE_URL = 'https://mask-network-dev.firefly.land/v1/calendar/crypto_event_list'

export class Calendar {
    static async getNewsList(startDate: number, endDate?: number) {
        const list = await fetchCachedJSON<EventResponse>(
            urlcat(BASE_URL, {
                provider_type: 'coincarp',
                start_date: startDate,
                end_date: endDate ? endDate : 0,
                cursor: 0,
            }),
        )
        return list?.data?.events?.map((x) => ({ ...x, event_date: +x.event_date * 1000 }))
    }
    static async getEventList(indicator?: PageIndicator) {
        const res = await fetchCachedJSON<EventResponse>(
            urlcat(BASE_URL, {
                provider_type: 'luma',
                size: 20,
                cursor: indicator?.id,
            }),
        )
        if (!res?.data?.events.length) {
            return createPageable([], indicator, createNextIndicator(indicator))
        }

        const events = res.data.events?.map((x) => ({ ...x, event_date: +x.event_date * 1000 }))
        return createPageable(events, indicator, createNextIndicator(indicator, res.data.page.next))
    }
}
