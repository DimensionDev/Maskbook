import urlcat from 'urlcat'
import { timeout } from '@masknet/kit'
import { attemptUntil } from '@masknet/web3-shared-base'
import {
    getSettings,
    getHeaders,
    getDefaultUserSettings,
    getUserSettings,
    getUserViaTwitterIdentity,
    staleUserByScreenName,
    getUserNFTAvatar,
    getUserNFTContainer,
    staleUserViaIdentity,
    getComputedUserSettings,
    getUserByScreenName,
    getUserByScreenNameShow,
} from './apis/index.js'
import { fetchJSON } from '../helpers/fetchJSON.js'
import type { TwitterBaseAPI } from '../entry-types.js'

const UPLOAD_AVATAR_URL = 'https://upload.twitter.com/i/media/upload.json'
const TWITTER_AVATAR_ID_MATCH = /^\/profile_images\/(\d+)/

export class TwitterAPI implements TwitterBaseAPI.Provider {
    getAvatarId(avatarURL?: string) {
        if (!avatarURL) return ''
        const match = new URL(avatarURL).pathname.match(TWITTER_AVATAR_ID_MATCH)
        return match ? match[1] : ''
    }

    getSettings() {
        return getSettings()
    }

    async getUserSettings() {
        const defaults = getDefaultUserSettings()
        const computed = getComputedUserSettings()

        try {
            const userSettings = await timeout(getUserSettings(), 5000, 'Timeout to get twitter user settings.')

            return {
                ...defaults,
                ...computed,
                ...userSettings,
            }
        } catch {
            return {
                ...defaults,
                ...computed,
            }
        }
    }

    async getUserNftContainer(screenName: string) {
        return await attemptUntil<TwitterBaseAPI.NFT | undefined>(
            [
                async () => {
                    const response = await getUserNFTContainer(screenName)
                    const result = response?.data.user?.result
                    if (!result?.has_nft_avatar) throw new Error(`User ${screenName} doesn't have NFT avatar.`)

                    return {
                        address: result.nft_avatar_metadata.smart_contract.address,
                        token_id: result.nft_avatar_metadata.token_id,
                    }
                },
                async () => {
                    const response = await getUserNFTAvatar(screenName)
                    const result = response.data.user?.result
                    if (!result?.has_nft_avatar) throw new Error(`User ${screenName} doesn't have NFT avatar.`)
                    return {
                        address: result.nft_avatar_metadata.smart_contract.address,
                        token_id: result.nft_avatar_metadata.token_id,
                    }
                },
            ],
            undefined,
        )
    }

    async uploadUserAvatar(screenName: string, image: File | Blob): Promise<TwitterBaseAPI.TwitterResult> {
        const headers = await getHeaders()

        // INIT
        const initURL = `${UPLOAD_AVATAR_URL}?command=INIT&total_bytes=${image.size}&media_type=${encodeURIComponent(
            image.type,
        )}`
        const initRes = await fetchJSON<{
            media_id_string: string
        }>(initURL, {
            method: 'POST',
            headers,
            credentials: 'include',
        })

        // APPEND
        const mediaId = initRes.media_id_string
        const appendURL = `${UPLOAD_AVATAR_URL}?command=APPEND&media_id=${mediaId}&segment_index=0`
        const formData = new FormData()
        formData.append('media', image)
        await fetch(appendURL, {
            method: 'POST',
            headers,
            body: formData,
            credentials: 'include',
        })

        // FINALIZE
        const finalizeURL = `${UPLOAD_AVATAR_URL}?command=FINALIZE&media_id=${mediaId}`
        return fetchJSON<TwitterBaseAPI.TwitterResult>(finalizeURL, {
            method: 'POST',
            headers,
            credentials: 'include',
        })
    }

    async updateProfileImage(screenName: string, media_id_str: string): Promise<TwitterBaseAPI.AvatarInfo | undefined> {
        const response = await fetch(
            urlcat('https://twitter.com/i/api/1.1/account/update_profile_image.json', {
                media_id: media_id_str,
                skip_status: 1,
                return_user: true,
            }),
            {
                method: 'POST',
                headers: await getHeaders({
                    referer: `https://twitter.com/${screenName}`,
                }),
                credentials: 'include',
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
        if (checkNFTAvatar) return getUserByScreenName(screenName)
        return attemptUntil<TwitterBaseAPI.User | null>(
            [
                () => getUserByScreenName(screenName),
                () => getUserByScreenNameShow(screenName),
                () => getUserViaTwitterIdentity(screenName),
            ],
            null,
        )
    }

    async staleUserByScreenName(screenName: string): Promise<void> {
        await staleUserByScreenName(screenName)
        await staleUserViaIdentity(screenName)
    }
}
