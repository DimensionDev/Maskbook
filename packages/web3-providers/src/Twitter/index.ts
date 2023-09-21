import { timeout } from '@masknet/kit'
import { attemptUntil } from '@masknet/web3-shared-base'
import {
    getSettings,
    getUserViaWebTimesAPI,
    getDefaultUserSettings,
    getUserSettings,
    getUserViaTwitterIdentity,
    staleUserViaWebAPI,
    getUserNFTAvatar,
    getUserNFTContainer,
    staleUserViaIdentity,
    getComputedUserSettings,
    createTweet,
} from './apis/index.js'
import { uploadMedia } from './apis/uploadMedia.js'
import { updateProfileImage } from './apis/updateProfileImage.js'
import type { TwitterBaseAPI } from '../entry-types.js'

export class TwitterAPI implements TwitterBaseAPI.Provider {
    getAvatarId(avatarURL?: string) {
        if (!avatarURL) return ''
        const match = new URL(avatarURL).pathname.match(/^\/profile_images\/(\d+)/)
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

    async uploadMedia(image: File | Blob): Promise<TwitterBaseAPI.MediaResult> {
        return uploadMedia(image)
    }

    async updateProfileImage(screenName: string, media_id_str: string): Promise<TwitterBaseAPI.AvatarInfo | undefined> {
        return updateProfileImage(screenName, media_id_str)
    }

    async getUserByScreenName(screenName: string, checkNFTAvatar?: boolean): Promise<TwitterBaseAPI.User | null> {
        if (checkNFTAvatar) return getUserViaWebTimesAPI(screenName)
        return attemptUntil<TwitterBaseAPI.User | null>(
            [() => getUserViaTwitterIdentity(screenName), () => getUserViaWebTimesAPI(screenName)],
            null,
        )
    }

    async staleUserByScreenName(screenName: string): Promise<void> {
        await staleUserViaWebAPI(screenName)
        await staleUserViaIdentity(screenName)
    }

    async createTweet(tweet: TwitterBaseAPI.Tweet) {
        const response = await createTweet(tweet)
        return response.rest_id
    }
}
