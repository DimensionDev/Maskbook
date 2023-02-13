import urlcat from 'urlcat'
import { getTokens } from './getTokens.js'
import type { TwitterBaseAPI } from '../../types/Twitter.js'
import { fetchCached, staleCached } from '../../helpers/fetchCached.js'

const features = {
    verified_phone_label_enabled: false,
    responsive_web_graphql_timeline_navigation_enabled: false,
    responsive_web_twitter_blue_verified_badge_is_enabled: false,
    responsive_web_twitter_blue_new_verification_copy_is_enabled: false,
}
async function createRequest(screenName: string) {
    const { bearerToken, csrfToken, queryId } = await getTokens('UserByScreenName')
    const url = urlcat('https://twitter.com/i/api/graphql/:queryId/UserByScreenName', {
        queryId,
        variables: JSON.stringify({
            screen_name: screenName,
            withSafetyModeUserFields: true,
            withSuperFollowsUserFields: true,
        }),
        features: JSON.stringify(features),
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

export async function getUserViaWebAPI(screenName: string, times = 0): Promise<TwitterBaseAPI.User | null> {
    const request = await createRequest(screenName)
    const response = await fetchCached(request)
    if (!response.ok) {
        if (times >= 3) return null
        const patchingFeatures: string[] = []
        const failedResponse: TwitterBaseAPI.FailedResponse = await response.json()
        for (const error of failedResponse.errors) {
            const match = error.message.match(/The following features cannot be null: (.*)$/)
            if (match) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Error in getUserByScreenName:', error.message)
                }
                patchingFeatures.push(...match[1].split(/,\s+/))
            }
        }
        if (patchingFeatures.length) {
            Object.assign(features, Object.fromEntries(patchingFeatures.map((x) => [x, false])))
            return getUserViaWebAPI(screenName, times + 1)
        }
    }

    const json: TwitterBaseAPI.UserByScreenNameResponse = await response.json()
    return json.data.user.result
}

export async function staleUserViaWebAPI(screenName: string): Promise<TwitterBaseAPI.User | null> {
    const request = await createRequest(screenName)
    const response = await staleCached(request)
    if (!response?.ok) return null

    const json: TwitterBaseAPI.UserByScreenNameResponse = await response.json()
    return json.data.user.result
}
