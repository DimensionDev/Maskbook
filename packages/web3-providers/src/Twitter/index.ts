import { timeout } from '@masknet/kit'
import { attemptUntil } from '@masknet/web3-shared-base'
import {
    getSettings,
    getDefaultUserSettings,
    getUserSettings,
    getUserViaTwitterIdentity,
    getComputedUserSettings,
    getUserByScreenName,
    getUserByScreenNameShow,
    staleUserByScreenName,
    staleUserByScreenNameShow,
    staleUserViaIdentity,
    createTweet,
    uploadMedia,
    updateProfileImage,
} from './apis/index.js'
import type { TwitterBaseAPI } from '../entry-types.js'

export class Twitter {
    static getAvatarId(avatarURL?: string) {
        if (!avatarURL) return ''
        const match = new URL(avatarURL).pathname.match(/^\/profile_images\/(\d+)/)
        return match ? match[1] : ''
    }

    static getSettings() {
        return getSettings()
    }

    static async getUserSettings() {
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

    static async uploadMedia(image: File | Blob): Promise<TwitterBaseAPI.MediaResponse> {
        return uploadMedia(image)
    }

    static async updateProfileImage(
        screenName: string,
        media_id_str: string,
    ): Promise<TwitterBaseAPI.AvatarInfo | undefined> {
        return updateProfileImage(screenName, media_id_str)
    }

    static async getUserByScreenName(
        screenName: string,
        checkNFTAvatar?: boolean,
    ): Promise<TwitterBaseAPI.User | null> {
        if (!screenName) return null
        if (checkNFTAvatar) return getUserByScreenName(screenName)
        return attemptUntil<TwitterBaseAPI.User | null>(
            [
                () => getUserByScreenNameShow(screenName),
                () => getUserByScreenName(screenName),
                () => getUserViaTwitterIdentity(screenName),
            ],
            null,
        )
    }

    static async staleUserByScreenName(screenName: string): Promise<void> {
        await staleUserByScreenName(screenName)
        await staleUserByScreenNameShow(screenName)
        await staleUserViaIdentity(screenName)
    }

    static async createTweet(tweet: TwitterBaseAPI.Tweet) {
        const response = await createTweet(tweet)
        return response.rest_id
    }
}
