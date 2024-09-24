import { twitterDomainMigrate } from '@masknet/shared-base'
import urlcat from 'urlcat'
import type { TwitterBaseAPI } from '../../entry-types.js'
import { staleCached } from '../../helpers/fetchCached.js'
import { fetchGlobal } from '../../helpers/fetchGlobal.js'
import { getHeaders } from './getTokens.js'

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

async function createRequest(screenName: string) {
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

function createUser(response: TwitterBaseAPI.UserResponse) {
    const result = response.data.user.result
    return {
        verified: result.legacy?.verified ?? false,
        has_nft_avatar: result.has_nft_avatar ?? false,
        userId: result.rest_id,
        nickname: result.legacy?.name ?? '',
        screenName: result.legacy?.screen_name ?? '', // handle
        avatarURL: result.legacy?.profile_image_url_https.replace(/_normal(\.\w+)$/, '_400x400$1'),
        bio: result.legacy?.description,
        location: result.legacy?.location,
        homepage: result.legacy?.entities.url.urls[0]?.expanded_url,
    }
}

export async function getUserByScreenName(screenName: string): Promise<TwitterBaseAPI.User | null> {
    const request = await createRequest(screenName)
    if (!request) return null

    const response = await fetchGlobal(request, undefined)
    if (response.ok) {
        const json: TwitterBaseAPI.UserResponse = await response.json()
        return createUser(json)
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
    const request = await createRequest(screenName)
    if (!request) return null

    const response = await staleCached(request)
    if (!response?.ok) return null

    const json: TwitterBaseAPI.UserResponse = await response.json()
    return createUser(json)
}
