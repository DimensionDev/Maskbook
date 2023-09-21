import { getHeaders } from './getTokens.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import type { TwitterBaseAPI } from '../../entry-types.js'

export async function getSettings() {
    return await fetchJSON<TwitterBaseAPI.Settings>('https://api.twitter.com/1.1/account/settings.json', {
        headers: getHeaders({
            referer: 'https://twitter.com/home',
        }),
        credentials: 'include',
    })
}
