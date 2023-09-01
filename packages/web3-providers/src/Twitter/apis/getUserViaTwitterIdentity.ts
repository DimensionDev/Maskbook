import urlcat from 'urlcat'
import { fetchCachedJSON } from '../../helpers/fetchJSON.js'
import { staleCached } from '../../helpers/fetchCached.js'
import type { TwitterBaseAPI } from '../../entry-types.js'

const TWITTER_IDENTITY_URL = 'https://a8fq5hs9nk.execute-api.us-east-1.amazonaws.com/prod/twitter'

function identityToLegacyUser(response: TwitterBaseAPI.IdentifyResponse): TwitterBaseAPI.User {
    return {
        id: response.id_str,
        rest_id: '',
        affiliates_highlighted_label: {},
        legacy: {
            created_at: response.created_at,
            default_profile: response.default_profile,
            default_profile_image: response.default_profile_image,
            description: response.description,
            entities: response.entities,
            favourites_count: response.favourites_count,
            follow_request_sent: response.follow_request_sent,
            followers_count: response.followers_count,
            following: response.following,
            friends_count: response.friends_count,
            has_custom_timelines: response.has_custom_timelines,
            is_translator: response.is_translator,
            listed_count: response.listed_count,
            location: response.location,
            media_count: response.media_count,
            name: response.name,
            notifications: response.notifications,
            profile_banner_url: response.profile_banner_url,
            profile_image_url_https: response.profile_image_url_https,
            protected: response.protected,
            screen_name: response.screen_name,
            statuses_count: response.statuses_count,
            translator_type: response.translator_type,
            url: response.url,
            verified: response.verified,
            withheld_in_countries: response.withheld_in_countries,
        },
    }
}
export async function getUserViaTwitterIdentity(screenName: string): Promise<TwitterBaseAPI.User | null> {
    const identity = await fetchCachedJSON<TwitterBaseAPI.IdentifyResponse>(
        urlcat(TWITTER_IDENTITY_URL, {
            screenName,
        }),
    )
    return identityToLegacyUser(identity)
}

export async function staleUserViaIdentity(screenName: string): Promise<TwitterBaseAPI.User | null> {
    const response = await staleCached(
        new URL(
            urlcat(TWITTER_IDENTITY_URL, {
                screenName,
            }),
        ),
    )
    if (!response?.ok) return null

    const identity: TwitterBaseAPI.IdentifyResponse = await response.json()
    return identityToLegacyUser(identity)
}
