import urlcat from 'urlcat'
import { getTokens } from './getTokens.js'
import { fetchCache, staleCache } from '../../helpers.js'
import type { TwitterBaseAPI } from '../../types/Twitter.js'

async function createRequest(screenName: string) {
    const { bearerToken, csrfToken, queryId } = await getTokens('UserByScreenName')
    const url = urlcat('https://twitter.com/i/api/graphql/:queryId/UserByScreenName', {
        queryId,
        variables: JSON.stringify({
            screen_name: screenName,
            withSafetyModeUserFields: true,
            withSuperFollowsUserFields: true,
        }),
        features: JSON.stringify({
            verified_phone_label_enabled: false,
            responsive_web_graphql_timeline_navigation_enabled: false,
            responsive_web_twitter_blue_verified_badge_is_enabled: false,
        }),
    })

    return new Request(url, {
        headers: {
            authorization: `Bearer ${bearerToken}`,
            'x-csrf-token': csrfToken,
            'content-type': 'application/json',
            'x-twitter-auth-type': 'OAuth2Session',
            'x-twitter-active-user': 'yes',
            referer: `https://twitter.com/${screenName}`,
        },
    })
}

export async function getUserByScreenName(screenName: string): Promise<TwitterBaseAPI.User | null> {
    const request = await createRequest(screenName)
    const response = await fetchCache(request)
    if (!response.ok) return null

    const json: TwitterBaseAPI.UserByScreenNameResponse = await response.json()
    return json.data.user.result
}

export async function staleUserByScreenName(screenName: string): Promise<TwitterBaseAPI.User | null> {
    const request = await createRequest(screenName)
    const response = await staleCache(request)
    if (!response?.ok) return null

    const json: TwitterBaseAPI.UserByScreenNameResponse = await response.json()
    return json.data.user.result
}
