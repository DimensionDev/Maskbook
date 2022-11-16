import urlcat from 'urlcat'
import type { TwitterBaseAPI } from '../../types/Twitter.js'

export async function getSettings(bearerToken: string, csrfToken: string): Promise<TwitterBaseAPI.Settings> {
    const response = await fetch(
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
    return response.json()
}
