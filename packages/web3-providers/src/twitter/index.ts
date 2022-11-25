import { escapeRegExp } from 'lodash-es'
import urlcat from 'urlcat'
import LRUCache from 'lru-cache'
import type { TwitterBaseAPI } from '../types/index.js'
import { attemptUntil } from '@masknet/web3-shared-base'

const UPLOAD_AVATAR_URL = 'https://upload.twitter.com/i/media/upload.json'
const TWITTER_IDENTITY_URL = 'https://mr8asf7i4h.execute-api.us-east-1.amazonaws.com/prod/twitter-identity'

function getScriptURL(content: string, name: string) {
    const matchURL = new RegExp(
        `https://abs.twimg.com/responsive-web/\(client-web|client-web-\\w+\)\{1\}/${escapeRegExp(
            `${name}.`,
        )}\\w+${escapeRegExp('.js')}`,
        'm',
    )
    const [url] = content.match(matchURL) ?? []
    return url
}

function getScriptContentMatched(content: string, pattern: RegExp) {
    const [, matched] = content.match(pattern) ?? []
    return matched
}

function getCSRFToken() {
    const ct0 = document.cookie.split('; ').find((x) => x.includes('ct0'))
    if (!ct0) return ''
    const [, value] = ct0.split('=')
    return value
}

const scriptCache = new LRUCache<string, Promise<Response> | string>({
    max: 10,
    ttl: 300_000,
})

async function fetchContent(url?: string) {
    if (!url) return

    const hit: Promise<Response> = scriptCache.get(url) ?? fetch(url)

    if (scriptCache.get(url) !== hit) scriptCache.set(url, hit)

    if (typeof hit === 'string') return hit

    const response = (await hit).clone()
    if (!response.ok) {
        scriptCache.delete(url)
        return
    }
    const content = await response.text()
    scriptCache.set(url, content)
    return content
}

async function getTokens(operationName?: string) {
    const swContent = await fetchContent('https://twitter.com/sw.js')
    if (!swContent) throw new Error('Failed to fetch manifest script.')

    const [mainContent, nftContent] = await Promise.all([
        fetchContent(getScriptURL(swContent, 'main')),
        fetchContent(getScriptURL(swContent, 'bundle.UserNft')),
    ])

    const bearerToken = getScriptContentMatched(mainContent ?? '', /,\w="(\w{20,}%3D\w{20,})",/)
    const queryToken = getScriptContentMatched(nftContent ?? '', /{\s?id:\s?"([\w-]+)"/)
    const csrfToken = getCSRFToken()
    const queryId = operationName
        ? getScriptContentMatched(mainContent ?? '', new RegExp(`queryId:"([^"]+)",operationName:"${operationName}"`))
        : undefined

    return {
        bearerToken,
        queryToken,
        csrfToken,
        queryId,
    }
}

async function getUserNftContainer(
    screenName: string,
    queryToken: string,
    bearerToken: string,
    csrfToken: string,
): Promise<{
    data: {
        user: {
            result: TwitterBaseAPI.NFTContainer
        }
    }
}> {
    const response = await fetch(
        urlcat('https://twitter.com/i/api/graphql/:queryToken/userNftContainer_Query', {
            queryToken,
            variables: JSON.stringify({
                screenName,
            }),
            features: JSON.stringify({
                responsive_web_twitter_blue_verified_badge_is_enabled: false,
            }),
        }),
        {
            headers: {
                authorization: `Bearer ${bearerToken}`,
                'x-csrf-token': csrfToken,
                'content-type': 'application/json',
                'x-twitter-auth-type': 'OAuth2Session',
                'x-twitter-active-user': 'yes',
                referer: `https://twitter.com/${screenName}/nft`,
            },
        },
    )
    return response.json()
}

async function getSettings(bearerToken: string, csrfToken: string): Promise<TwitterBaseAPI.Settings> {
    const response = await fetch(
        urlcat('https://twitter.com/i/api/1.1/account/settings.json', {
            include_mention_filter: false,
            include_nsfw_user_flag: false,
            include_nsfw_admin_flag: false,
            include_ranked_timeline: false,
            include_alt_text_compose: false,
            include_country_code: false,
            include_ext_dm_nsfw_media_filter: false,
        }),
        {
            headers: {
                authorization: `Bearer ${bearerToken}`,
                'x-csrf-token': csrfToken,
                'content-type': 'application/json',
                'x-twitter-auth-type': 'OAuth2Session',
                'x-twitter-active-user': 'yes',
                referer: 'https://twitter.com/home',
            },
        },
    )
    return response.json()
}

const cache = new LRUCache<string, any>({
    max: 40,
    ttl: 300_000,
})

const TWITTER_AVATAR_ID_MATCH = /^\/profile_images\/(\d+)/

export class TwitterAPI implements TwitterBaseAPI.Provider {
    private features: {}
    constructor() {
        this.features = {
            verified_phone_label_enabled: false,
            responsive_web_graphql_timeline_navigation_enabled: false,
            responsive_web_twitter_blue_verified_badge_is_enabled: false,
            responsive_web_twitter_blue_new_verification_copy_is_enabled: false,
        }
    }
    getAvatarId(avatarURL?: string) {
        if (!avatarURL) return ''
        const url = new URL(avatarURL)
        const match = url.pathname.match(TWITTER_AVATAR_ID_MATCH)
        if (!match) return ''

        return match[1]
    }
    async getSettings() {
        const { bearerToken, csrfToken } = await getTokens()
        return getSettings(bearerToken, csrfToken)
    }
    async getUserNftContainer(screenName: string) {
        const { bearerToken, queryToken, csrfToken } = await getTokens()
        const result = await getUserNftContainer(screenName, queryToken, bearerToken, csrfToken)
        if (!result?.data?.user?.result?.has_nft_avatar) throw new Error('No NFT avatar.')

        return {
            address: result.data.user.result.nft_avatar_metadata.smart_contract.address,
            token_id: result.data.user.result.nft_avatar_metadata.token_id,
        }
    }

    async uploadUserAvatar(screenName: string, image: File | Blob): Promise<TwitterBaseAPI.TwitterResult> {
        const { bearerToken, csrfToken } = await getTokens()
        const headers = {
            authorization: `Bearer ${bearerToken}`,
            'x-csrf-token': csrfToken,
            'x-twitter-auth-type': 'OAuth2Session',
            'x-twitter-active-user': 'yes',
            referer: `https://twitter.com/${screenName}`,
        }

        // INIT
        const initURL = `${UPLOAD_AVATAR_URL}?command=INIT&total_bytes=${image.size}&media_type=${encodeURIComponent(
            image.type,
        )}`
        const initRes = await request<{
            media_id_string: string
        }>(initURL, {
            method: 'POST',
            credentials: 'include',
            headers,
        })
        const mediaId = initRes.media_id_string
        // APPEND

        const appendURL = `${UPLOAD_AVATAR_URL}?command=APPEND&media_id=${mediaId}&segment_index=0`
        const formData = new FormData()
        formData.append('media', image)
        await fetch(appendURL, {
            method: 'POST',
            credentials: 'include',
            body: formData,
            headers,
        })

        // FINALIZE
        const finalizeURL = `${UPLOAD_AVATAR_URL}?command=FINALIZE&media_id=${mediaId}`
        return request<TwitterBaseAPI.TwitterResult>(finalizeURL, {
            method: 'POST',
            credentials: 'include',
            headers,
        })
    }
    async updateProfileImage(screenName: string, media_id_str: string): Promise<TwitterBaseAPI.AvatarInfo | undefined> {
        const { bearerToken, queryToken, csrfToken } = await getTokens()
        const headers = {
            authorization: `Bearer ${bearerToken}`,
            'x-csrf-token': csrfToken,
            'content-type': 'application/json',
            'x-twitter-auth-type': 'OAuth2Session',
            'x-twitter-active-user': 'yes',
            referer: `https://twitter.com/${screenName}`,
        }
        const updateProfileImageURL = 'https://twitter.com/i/api/1.1/account/update_profile_image.json'
        if (!bearerToken || !queryToken || !csrfToken) return

        const response = await fetch(
            urlcat(updateProfileImageURL, {
                media_id: media_id_str,
                skip_status: 1,
                return_user: true,
            }),
            {
                method: 'POST',
                credentials: 'include',
                headers,
            },
        )

        const updateInfo = await response.json()
        return {
            imageUrl: updateInfo.profile_image_url_https,
            mediaId: updateInfo.id_str,
            nickname: updateInfo.name,
            userId: updateInfo.screen_name,
        }
    }

    async getUserByScreenName(screenName: string, checkNFTAvatar?: boolean): Promise<TwitterBaseAPI.User | null> {
        if (checkNFTAvatar) return this.getUserViaWebAPI(screenName)
        return attemptUntil<TwitterBaseAPI.User | null>(
            [() => this.getUserViaWebAPI(screenName), () => this.getUserViaTwitterIdentity(screenName)],
            null,
        )
    }

    private async getUserViaWebAPI(screenName: string, times = 0): Promise<TwitterBaseAPI.User | null> {
        const { bearerToken, csrfToken, queryId } = await getTokens('UserByScreenName')
        const url = urlcat('https://twitter.com/i/api/graphql/:queryId/UserByScreenName', {
            queryId,
            variables: JSON.stringify({
                screen_name: screenName,
                withSafetyModeUserFields: true,
                withSuperFollowsUserFields: true,
            }),
            features: JSON.stringify(this.features),
        })
        const cacheKey = `${bearerToken}/${csrfToken}/${queryId}/${screenName}`
        const fetchingTask: Promise<Response> =
            cache.get(cacheKey) ??
            fetch(url, {
                headers: {
                    authorization: `Bearer ${bearerToken}`,
                    'x-csrf-token': csrfToken,
                    'content-type': 'application/json',
                    'x-twitter-auth-type': 'OAuth2Session',
                    'x-twitter-active-user': 'yes',
                    referer: `https://twitter.com/${screenName}`,
                },
            })

        cache.set(cacheKey, fetchingTask)
        const response = (await fetchingTask).clone()
        if (!response.ok) {
            cache.delete(cacheKey)
            const failedResponse: TwitterBaseAPI.FailedResponse = await response.json()
            if (times >= 3) return null
            const features: string[] = []
            for (const error of failedResponse.errors) {
                const match = error.message.match(/The following features cannot be null: (.*)$/)
                if (match) {
                    if (process.env.NODE_ENV === 'development') {
                        console.error(error.message)
                    }
                    features.push(...match[1].split(/,\s+/))
                }
            }
            if (features.length) {
                this.features = { ...this.features, ...Object.fromEntries(features.map((x) => [x, false])) }
                return this.getUserViaWebAPI(screenName, times + 1)
            }
            return null
        }
        const userResponse: TwitterBaseAPI.UserByScreenNameResponse = await response.json()
        return userResponse.data.user.result
    }
    /**
     * Convert response from twitter identity to web API getUserByScreenName
     */
    private identityToLegacyUser(response: TwitterBaseAPI.IdentifyResponse): TwitterBaseAPI.User {
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
    private async getUserViaTwitterIdentity(screenName: string): Promise<TwitterBaseAPI.User | null> {
        const url = urlcat(TWITTER_IDENTITY_URL, {
            screenName,
        })
        const response = await fetch(url)
        if (!response.ok) return null
        const identity: TwitterBaseAPI.IdentifyResponse = await response.json()
        return this.identityToLegacyUser(identity)
    }
}

function request<TResponse>(
    url: string,
    // `RequestInit` is a type for configuring
    // a `fetch` request. By default, an empty object.
    config: RequestInit = {},
): Promise<TResponse> {
    // Inside, we call the `fetch` function with
    // a URL and config given:
    return (
        fetch(url, config)
            // When got a response call a `json` method on it
            .then((response) => response.json())
            // and return the result data.
            .then((data) => data as TResponse)
    )

    // We also can use some post-response
    // data-transformations in the last `then` clause.
}
