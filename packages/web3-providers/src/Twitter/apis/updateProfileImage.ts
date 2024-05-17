import urlcat from 'urlcat'
import type { TwitterBaseAPI } from '../../entry-types.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import { getHeaders } from './getTokens.js'
import { twitterDomainMigrate } from '@masknet/shared-base'

export async function updateProfileImage(
    screenName: string,
    media_id_str: string,
): Promise<TwitterBaseAPI.AvatarInfo | undefined> {
    const profile = await fetchJSON<{
        profile_image_url_https: string
        id_str: string
        name: string
        screen_name: string
    }>(
        urlcat(twitterDomainMigrate('https://x.com/i/api/1.1/account/update_profile_image.json'), {
            media_id: media_id_str,
            skip_status: 1,
            return_user: true,
        }),
        {
            method: 'POST',
            headers: getHeaders({
                referer: twitterDomainMigrate(`https://x.com/${screenName}`),
            }),
            credentials: 'include',
        },
    )

    return {
        imageUrl: profile.profile_image_url_https,
        mediaId: profile.id_str,
        nickname: profile.name,
        userId: profile.screen_name,
    }
}
