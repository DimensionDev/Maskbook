import urlcat from 'urlcat'
import { getTokens } from './getTokens.js'
import type { TwitterBaseAPI } from '../../entry-types.js'
import { fetchJSON } from '../../entry-helpers.js'

export async function getSettings() {
    const { bearerToken, csrfToken } = await getTokens()
    return fetchJSON<TwitterBaseAPI.Settings>(
        urlcat('https://twitter.com/i/api/1.1/account/settings.json', {
            include_mention_filter: false,
            include_nsfw_user_flag: false,
            include_nsfw_admin_flag: false,
            include_ranked_timeline: false,
            include_alt_text_compose: false,
            include_country_code: false,
            include_ext_dm_nsfw_media_filter: false,
        }),
        {
            headers: {
                authorization: `Bearer ${bearerToken}`,
                'x-csrf-token': csrfToken,
                'content-type': 'application/json',
                'x-twitter-auth-type': 'OAuth2Session',
                'x-twitter-active-user': 'yes',
                referer: 'https://twitter.com/home',
            },
        },
    )
}
