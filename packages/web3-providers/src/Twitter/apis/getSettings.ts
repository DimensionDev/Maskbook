import { getHeaders } from './getTokens.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import type { TwitterBaseAPI } from '../../entry-types.js'
import { twitterDomainMigrate } from '@masknet/shared-base'

export async function getSettings() {
    return fetchJSON<TwitterBaseAPI.Settings>(twitterDomainMigrate('https://api.x.com/1.1/account/settings.json'), {
        headers: getHeaders({
            referer: twitterDomainMigrate('https://x.com/home'),
        }),
        credentials: 'include',
    })
}
