import { fetchCachedJSON } from '../entry-helpers.js'
import urlcat from 'urlcat'
import { type CalendarBaseAPI } from '../types/Calendar.js'

const BASE_URL = 'https://mask-network-dev.firefly.land/v1/calendar/crypto_event_list'

export class CalendarAPI implements CalendarBaseAPI.Provider {
    async getNewsList(date: number) {
        const list = await fetchCachedJSON<any>(
            urlcat(BASE_URL, {
                provider_type: 'coincarp',
                date,
                cursor: 0,
            }),
        )
        return list?.data?.events?.map((x: any) => ({ ...x, event_date: x.event_date * 1000 }))
    }
    async getEventList(date: number) {
        const list = await fetchCachedJSON<any>(
            urlcat(BASE_URL, {
                provider_type: 'link3',
                date,
                cursor: 0,
            }),
        )
        return list?.data?.events?.map((x: any) => ({ ...x, event_date: x.event_date * 1000 }))
    }
    async getNFTList(date: number) {
        const list = await fetchCachedJSON<any>(
            urlcat(BASE_URL, {
                provider_type: 'nftgo',
                date,
                cursor: 0,
            }),
        )
        return list?.data?.events?.map((x: any) => ({ ...x, event_date: x.event_date * 1000 }))
    }
}
