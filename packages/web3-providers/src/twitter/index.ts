import { escapeRegExp } from 'lodash-unified'
import urlcat from 'urlcat'
import LRUCache from 'lru-cache'
import type { TwitterBaseAPI } from '../types'

const UPLOAD_AVATAR_URL = 'https://upload.twitter.com/i/media/upload.json'

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

async function getScriptContent(url: string) {
    const response = await fetch(url)
    return response.text()
}

let swContent = ''
async function getTokens(operationName?: string) {
    swContent = swContent || (await getScriptContent('https://twitter.com/sw.js'))
    const [mainContent, nftContent] = await Promise.all([
        getScriptContent(getScriptURL(swContent ?? '', 'main')),
        getScriptContent(getScriptURL(swContent ?? '', 'bundle.UserNft')),
    ])

    const bearerToken = getScriptContentMatched(mainContent ?? '', /s="(\w+%3D\w+)"/)
    const queryToken = getScriptContentMatched(nftContent ?? '', /{\s?id:\s?"([\w-]+)"/)
    const csrfToken = getCSRFToken()
    const queryId = operationName
        ? getScriptContentMatched(mainContent ?? '', new RegExp(`queryId:"(\\w+)",operationName:"${operationName}"`))
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
        urlcat(
            `https://twitter.com/i/api/graphql/:queryToken/userNftContainer_Query?variables=${encodeURIComponent(
                JSON.stringify({
                    screenName,
                }),
            )}`,
            {
                queryToken,
            },
        ),
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
    max: 20,
    ttl: 300_000,
})

export class TwitterAPI implements TwitterBaseAPI.Provider {
    async getSettings() {
        const { bearerToken, queryToken, csrfToken } = await getTokens()
        if (!bearerToken || !csrfToken) return
        return getSettings(bearerToken, csrfToken)
    }
    async getUserNftContainer(screenName: string) {
        const { bearerToken, queryToken, csrfToken } = await getTokens()
        if (!bearerToken || !queryToken || !csrfToken) return
        const result = await getUserNftContainer(screenName, queryToken, bearerToken, csrfToken)
        if (!result?.data?.user?.result?.has_nft_avatar) return
        return {
            address: result.data.user.result.nft_avatar_metadata.smart_contract.address,
            token_id: result.data.user.result.nft_avatar_metadata.token_id,
            type_name: result.data.user.result.nft_avatar_metadata.smart_contract.__typename,
        }
    }

    async uploadUserAvatar(screenName: string, image: File | Blob): Promise<TwitterBaseAPI.TwitterResult> {
        // INIT
        const initURL = `${UPLOAD_AVATAR_URL}?command=INIT&total_bytes=${image.size}&media_type=${encodeURIComponent(
            image.type,
        )}`
        const initRes = await request<{ media_id_string: string }>(initURL, {
            method: 'POST',
            credentials: 'include',
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
        })

        // FINALIZE
        const finalizeURL = `${UPLOAD_AVATAR_URL}?command=FINALIZE&media_id=${mediaId}`
        return request<TwitterBaseAPI.TwitterResult>(finalizeURL, {
            method: 'POST',
            credentials: 'include',
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
        })
        const cacheKey = `${bearerToken}/${csrfToken}/${url}`
        let fetchingTask: Promise<Response> | undefined = cache.get(cacheKey)
        if (!fetchingTask) {
            fetchingTask = fetch(url, {
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
        }
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

    // This function is async, it will return a Promise:
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
