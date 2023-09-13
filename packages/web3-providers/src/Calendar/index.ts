import { fetchCachedJSON } from '../entry-helpers.js'
import urlcat from 'urlcat'
import { type CalendarBaseAPI } from '../types/Calendar.js'

const BASE_URL = 'https://mask-network-dev.firefly.land/v1/calendar/crypto_event_list'

export class CalendarAPI implements CalendarBaseAPI.Provider {
    async getNewsList(date: number) {
        return await fetchCachedJSON(
            urlcat(BASE_URL, {
                provider_type: 'coincarp',
                date,
                cursor: 0,
            }),
        )
    }
    async getEventList(date: number) {
        return await fetchCachedJSON(
            urlcat(BASE_URL, {
                provider_type: 'link3',
                date,
                cursor: 0,
            }),
        )
    }
    async getNFTList(date: number) {
        return await fetchCachedJSON(
            urlcat(BASE_URL, {
                provider_type: 'nftgo',
                date,
                cursor: 0,
            }),
        )
    }
}
