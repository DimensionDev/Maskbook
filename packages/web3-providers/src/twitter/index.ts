import urlcat from 'urlcat'
import LRUCache from 'lru-cache'
import type { TwitterBaseAPI } from '../types/index.js'
import { getSettings, getTokens, getUserNFTContainer } from './apis/index.js'

const UPLOAD_AVATAR_URL = 'https://upload.twitter.com/i/media/upload.json'

const cache = new LRUCache<string, any>({
    max: 40,
    ttl: 300_000,
})

const TWITTER_AVATAR_ID_MATCH = /^\/profile_images\/(\d+)/

export class TwitterAPI implements TwitterBaseAPI.Provider {
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
        const result = await getUserNFTContainer(screenName, queryToken, bearerToken, csrfToken)
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

    async getUserByScreenName(screenName: string): Promise<TwitterBaseAPI.User | null> {
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
            return null
        }
        const userResponse: TwitterBaseAPI.UserByScreenNameResponse = await response.json()
        return userResponse.data.user.result
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
