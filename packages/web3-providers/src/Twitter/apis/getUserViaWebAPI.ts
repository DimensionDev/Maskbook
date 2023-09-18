import urlcat from 'urlcat'
import { isNull } from 'lodash-es'
import { attemptTimes } from '@masknet/web3-shared-base'
import { getHeaders } from './getTokens.js'
import { fetchGlobal } from '../../helpers/fetchGlobal.js'
import { Expiration } from '../../helpers/fetchSquashed.js'
import { Duration, staleCached } from '../../helpers/fetchCached.js'
import type { TwitterBaseAPI } from '../../entry-types.js'

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
    hidden_profile_subscriptions_enabled: false,
    subscriptions_verification_info_is_identity_verified_enabled: false,
}

async function createRequest(screenName: string) {
    const url = urlcat('https://twitter.com/i/api/graphql/sLVLhk0bGj3MVFEKTdax1w/UserByScreenName', {
        variables: JSON.stringify({
            screen_name: screenName,
            withSafetyModeUserFields: true,
            withSuperFollowsUserFields: true,
        }),
        features: JSON.stringify(features),
    })

    return new Request(url, {
        headers: await getHeaders({
            'content-type': 'application/json',
            'x-twitter-client-language': navigator.language ? navigator.language : 'en',
            referer: `https://twitter.com/${screenName}`,
        }),
        credentials: 'include',
    })
}

export async function getUserViaWebAPI(screenName: string): Promise<TwitterBaseAPI.User | null> {
    const request = await createRequest(screenName)
    if (!request) return null

    const response = await fetchGlobal(request, undefined, {
        cacheDuration: Duration.ONE_MINUTE,
        squashExpiration: Expiration.ONE_SECOND,
    })
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
