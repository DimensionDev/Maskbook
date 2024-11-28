import { createIndicator, createNextIndicator, createPageable, type PageIndicator } from '@masknet/shared-base'
import { compact } from 'lodash-es'
import urlcat from 'urlcat'
import { fetchCachedJSON } from '../entry-helpers.js'
import type { Event, EventDatesResponse, EventProvider, EventResponse, ParsedEvent } from './types.js'

const BASE_URL = 'https://mask-network-dev.firefly.land/v1/calendar/'

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
    hosts: Array<{
        avatar_url: string
        name: string
    }>
}
function fixEvent(event: Event): ParsedEvent {
    const rawEvent = event.raw_data ? (event.raw_data as LumaRawEvent) : null
    if (!rawEvent) return fixEventDate(event)
    const host = rawEvent.hosts[0]

    return {
        ...event,
        event_date: +event.event_date * 1000,
        event_city: rawEvent.calendar.geo_city,
        event_country: rawEvent.calendar.geo_country,
        event_full_location:
            rawEvent.event.geo_address_info.full_address ||
            compact([rawEvent.calendar.geo_region, rawEvent.calendar.geo_city, rawEvent.calendar.geo_country]).join(
                ', ',
            ),
        host_name: host?.name,
        host_avatar: host?.avatar_url,
    }
}

const SIZE = 50
export class Calendar {
    static async getNewsList(startDate: number, endDate?: number, indicator?: PageIndicator) {
        const res = await fetchCachedJSON<EventResponse>(
            urlcat(BASE_URL, 'crypto_event_list', {
                provider_type: 'coincarp',
                size: SIZE,
                start_date: Math.floor(startDate / 1000),
                end_date: endDate ? Math.floor(endDate / 1000) : 0,
                cursor: indicator?.id,
            }),
        )
        if (!res.data?.events.length) return createPageable([], createIndicator(indicator))
        const events = res.data.events.map(fixEventDate)
        const next = events.length < SIZE ? undefined : res.data.page.next
        return createPageable(
            events,
            indicator,
            next && next !== '0' ? createNextIndicator(indicator, next) : undefined,
        )
    }
    static async getEventList(start_date: number, end_date: number, indicator?: PageIndicator) {
        const res = await fetchCachedJSON<EventResponse>(
            urlcat(BASE_URL, 'crypto_event_list', {
                provider_type: 'luma',
                size: SIZE,
                cursor: indicator?.id,
                start_date: start_date / 1000,
                end_date: end_date / 1000,
            }),
        )
        if (!res.data?.events.length) return createPageable([], createIndicator(indicator))

        const events = res.data.events.map(fixEvent)
        const next = events.length < SIZE ? undefined : res.data.page.next
        return createPageable(
            events,
            indicator,
            next && next !== '0' ? createNextIndicator(indicator, next) : undefined,
        )
    }
    static async getAvailableDates(type: EventProvider, start_date: number, end_date: number) {
        const res = await fetchCachedJSON<EventDatesResponse>(
            urlcat(BASE_URL, 'crypto_event_date_list', {
                provider_type: type,
                start_date: start_date / 1000,
                end_date: end_date / 1000,
            }),
        )
        return (res.data || []).map((x) => x * 1000)
    }
}
