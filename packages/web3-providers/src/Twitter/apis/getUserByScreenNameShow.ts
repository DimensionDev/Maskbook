import urlcat from 'urlcat'
import { getHeaders } from './getTokens.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import { type TwitterBaseAPI } from '../../entry-types.js'

function createUser(response: TwitterBaseAPI.ShowResult): TwitterBaseAPI.User {
    return {
        verified: response.verified,
        has_nft_avatar: false,
        userId: response.id_str,
        nickname: response.name,
        screenName: response.screen_name,
        avatarURL: response.profile_image_url_https.replace(/_normal(\.\w+)$/, '_400x400$1'),
        bio: response.description,
        location: response.location,
        homepage: response.entities?.url?.urls[0]?.expanded_url,
    }
}

export async function getUserByScreenNameShow(screenName: string): Promise<TwitterBaseAPI.User | null> {
    const response = await fetchJSON<TwitterBaseAPI.ShowResult>(
        urlcat('https://api.twitter.com/1.1/users/show.json', {
            screen_name: screenName,
        }),
        {
            headers: await getHeaders(),
            credentials: 'include',
        },
    )
    return createUser(response)
}
