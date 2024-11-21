import { createNextIndicator, createPageable, type PageIndicator } from '@masknet/shared-base'
import { compact } from 'lodash-es'
import urlcat from 'urlcat'
import { fetchCachedJSON } from '../entry-helpers.js'
import type { Event, EventResponse, ParsedEvent } from './types.js'

const BASE_URL = 'https://mask-network-dev.firefly.land/v1/calendar/crypto_event_list'

function fixEventDate(event: Event): ParsedEvent {
    return {
        ...event,
        event_date: +event.event_date * 1000,
    }
}

function fixEvent(event: Event): ParsedEvent {
    const originData = (
        event.raw_data as {
            calendar: {
                geo_city: string
                geo_country: string
                geo_region: string
            }
        }
    ).calendar
    return {
        ...event,
        event_date: +event.event_date * 1000,
        event_city: originData.geo_city,
        event_country: originData.geo_country,
        event_full_location: compact([originData.geo_region, originData.geo_city, originData.geo_country]).join(', '),
    }
}

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
        if (!list.data) return
        return list.data.events.map(fixEventDate)
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

        const events = res.data.events.map(fixEvent)
        return createPageable(events, indicator, createNextIndicator(indicator, res.data.page.next))
    }
}
