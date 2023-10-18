import urlcat from 'urlcat'
import { fetchCachedJSON } from '../entry-helpers.js'
import { type CalendarBaseAPI } from '../types/Calendar.js'

const BASE_URL = 'https://mask-network.firefly.land/v1/calendar/crypto_event_list'

export class CalendarAPI implements CalendarBaseAPI.Provider {
    async getNewsList(startDate: number, endDate?: number) {
        const list = await fetchCachedJSON<any>(
            urlcat(BASE_URL, {
                provider_type: 'coincarp',
                start_date: startDate,
                end_date: endDate ? endDate : 0,
                cursor: 0,
            }),
        )
        return list?.data?.events?.map((x: any) => ({ ...x, event_date: x.event_date * 1000 }))
    }
    async getEventList(startDate: number, endDate?: number) {
        const list = await fetchCachedJSON<any>(
            urlcat(BASE_URL, {
                provider_type: 'link3',
                start_date: startDate,
                end_date: endDate ? endDate : 0,
                cursor: 0,
            }),
        )
        return list?.data?.events?.map((x: any) => ({ ...x, event_date: x.event_date * 1000 }))
    }
    async getNFTList(startDate: number, endDate?: number) {
        const list = await fetchCachedJSON<any>(
            urlcat(BASE_URL, {
                provider_type: 'nftgo',
                start_date: startDate,
                end_date: endDate ? endDate : 0,
                cursor: 0,
            }),
        )
        return list?.data?.events?.map((x: any) => ({ ...x, event_date: x.event_date * 1000 }))
    }
}
