import urlcat from 'urlcat'
import type { TwitterBaseAPI } from '../../entry-types.js'
import { staleCached } from '../../helpers/fetchCached.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import { getHeaders } from './getTokens.js'

function createUser(response: TwitterBaseAPI.UserShowResponse): TwitterBaseAPI.User {
    return {
        verified: response.verified,
        has_nft_avatar: false,
        userId: response.id_str,
        nickname: response.name,
        screenName: response.screen_name,
        avatarURL: response.profile_image_url_https.replace(/_normal(\.\w+)$/, '_400x400$1'),
        bio: response.description,
        location: response.location,
        homepage: response.entities.url?.urls[0]?.expanded_url || response.entities.description?.urls[0],
    }
}

async function createRequest(screenName: string) {
    const url = urlcat('https://api.twitter.com/1.1/users/show.json', {
        screen_name: screenName,
    })
    return new Request(url, {
        headers: getHeaders(),
        credentials: 'include',
    })
}

export async function getUserByScreenNameShow(screenName: string): Promise<TwitterBaseAPI.User | null> {
    const request = await createRequest(screenName)
    const response = await fetchJSON<TwitterBaseAPI.UserShowResponse>(request, undefined)
    return createUser(response)
}

export async function staleUserByScreenNameShow(screenName: string): Promise<TwitterBaseAPI.User | null> {
    const request = await createRequest(screenName)
    if (!request) return null

    const response = await staleCached(request)
    if (!response?.ok) return null

    const json: TwitterBaseAPI.UserShowResponse = await response.json()
    return createUser(json)
}
