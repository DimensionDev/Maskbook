import { twitterDomainMigrate } from '@masknet/shared-base'
import urlcat from 'urlcat'
import type { TwitterBaseAPI } from '../../entry-types.js'
import { staleCached } from '../../helpers/fetchCached.js'
import { fetchGlobal } from '../../helpers/fetchGlobal.js'
import { getHeaders } from './getTokens.js'
import { createUser } from './helpers.js'

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
    subscriptions_feature_can_gift_premium: false,
    // cspell:disable-next-line
    rweb_tipjar_consumption_enabled: false,
    responsive_web_twitter_article_notes_tab_enabled: false,
}

function createRequest(screenName: string) {
    // cspell:disable-next-line
    const url = urlcat('https://x.com/i/api/graphql/Yka-W8dz7RaEuQNkroPkYw/UserByScreenName', {
        variables: JSON.stringify({
            screen_name: screenName,
            withSafetyModeUserFields: true,
            withSuperFollowsUserFields: true,
        }),
        features: JSON.stringify(features),
    })

    return new Request(url, {
        headers: getHeaders({
            'content-type': 'application/json',
            referer: twitterDomainMigrate(`https://x.com/${screenName}`),
        }),
        credentials: 'include',
    })
}

export async function getUserByScreenName(screenName: string): Promise<TwitterBaseAPI.User | null> {
    const request = createRequest(screenName)

    const response = await fetchGlobal(request, undefined)
    if (response.ok) {
        const json: TwitterBaseAPI.UserResponse = await response.json()
        return createUser(json.data.user.result)
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

export async function staleUserByScreenName(screenName: string): Promise<TwitterBaseAPI.User | null> {
    const request = createRequest(screenName)
    if (!request) return null

    const response = await staleCached(request)
    if (!response?.ok) return null

    const json: TwitterBaseAPI.UserResponse = await response.json()
    return createUser(json.data.user.result)
}
