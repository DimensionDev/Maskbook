import urlcat from 'urlcat'
import { isNull } from 'lodash-es'
import { attemptTimes } from '@masknet/web3-shared-base'
import { getTokens, getHeaders } from './getTokens.js'
import type { TwitterBaseAPI } from '../../entry-types.js'
import { fetchCached, staleCached } from '../../entry-helpers.js'

const features = {
    responsive_web_twitter_blue_verified_badge_is_enabled: true,
    responsive_web_graphql_exclude_directive_enabled: false,
    verified_phone_label_enabled: false,
    responsive_web_twitter_blue_new_verification_copy_is_enabled: false,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    responsive_web_graphql_timeline_navigation_enabled: true,
    blue_business_profile_image_shape_enabled: false,
    subscriptions_verification_info_verified_since_enabled: false,
    creator_subscriptions_tweet_preview_api_enabled: false,
    highlights_tweets_tab_ui_enabled: false,
    hidden_profile_likes_enabled: false,
}

async function createRequest(screenName: string) {
    const { queryId } = await getTokens('UserByScreenName')
    if (!queryId) return
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
        headers: await getHeaders({
            referer: `https://twitter.com/${screenName}`,
        }),
    })
}

export async function getUserViaWebAPI(screenName: string): Promise<TwitterBaseAPI.User | null> {
    const request = await createRequest(screenName)
    if (!request) return null

    const response = await fetchCached(request)
    if (response.ok) {
        const json: TwitterBaseAPI.UserByScreenNameResponse = await response.json()
        return json.data.user.result
    }

    const patchingFeatures: string[] = []
    const failedResponse: TwitterBaseAPI.FailedResponse = await response.json()
    for (const error of failedResponse.errors) {
        const matched = error.message.match(/The following features cannot be null: (.*)$/)
        if (matched) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error in getUserByScreenName:', error.message)
            }
            patchingFeatures.push(...matched[1].split(/,\s+/))
        }
    }
    if (patchingFeatures.length) {
        Object.assign(features, Object.fromEntries(patchingFeatures.map((x) => [x, false])))
    }
    return null
}

export const getUserViaWebTimesAPI = (screenName: string) => {
    return attemptTimes(() => getUserViaWebAPI(screenName), null, isNull)
}

export async function staleUserViaWebAPI(screenName: string): Promise<TwitterBaseAPI.User | null> {
    const request = await createRequest(screenName)
    if (!request) return null
    const response = await staleCached(request)
    if (!response?.ok) return null

    const json: TwitterBaseAPI.UserByScreenNameResponse = await response.json()
    return json.data.user.result
}
