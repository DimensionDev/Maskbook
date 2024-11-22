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

interface LumaRawEvent {
    calendar: {
        geo_city: string
        geo_country: string
        geo_region: string
    }
    event: {
        geo_address_info: {
            address: string
            city: string
            city_state: string
            country: string
            full_address: string
            latitude: string
            longitude: string
            mode: string
            place_id: string
            region: string
            type: string
        }
    }
}
function fixEvent(event: Event): ParsedEvent {
    const rawEvent = event.raw_data ? (event.raw_data as LumaRawEvent) : null
    return {
        ...event,
        event_date: +event.event_date * 1000,
        event_city: rawEvent?.calendar.geo_city,
        event_country: rawEvent?.calendar.geo_country,
        event_full_location:
            rawEvent?.event.geo_address_info.full_address ||
            compact([rawEvent?.calendar.geo_region, rawEvent?.calendar.geo_city, rawEvent?.calendar.geo_country]).join(
                ', ',
            ),
    }
}

export class Calendar {
    static async getNewsList(startDate: number, endDate?: number) {
        const list = await fetchCachedJSON<EventResponse>(
            urlcat(BASE_URL, {
                provider_type: 'coincarp',
                start_date: Math.floor(startDate / 1000),
                end_date: endDate ? Math.floor(endDate / 1000) : 0,
                cursor: 0,
            }),
        )
        if (!list.data) return
        return list.data.events.map(fixEventDate)
    }
    static async getEventList(start_date: number, end_date: number, indicator?: PageIndicator) {
        const res = await fetchCachedJSON<EventResponse>(
            urlcat(BASE_URL, {
                provider_type: 'luma',
                size: 20,
                cursor: indicator?.id,
                start_date: start_date / 1000,
                end_date: end_date / 1000,
            }),
        )
        if (!res?.data?.events.length) {
            return createPageable([], indicator, createNextIndicator(indicator))
        }

        const events = res.data.events.map(fixEvent)
        return createPageable(events, indicator, createNextIndicator(indicator, res.data.page.next))
    }
}
