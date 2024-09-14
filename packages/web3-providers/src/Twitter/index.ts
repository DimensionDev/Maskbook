import { timeout } from '@masknet/kit'
import type { TwitterBaseAPI } from '../entry-types.js'
import {
    createTweet,
    getComputedUserSettings,
    getDefaultUserSettings,
    getSettings,
    getUserByScreenName,
    getUserSettings,
    staleUserByScreenName,
    updateProfileImage,
    uploadMedia,
} from './apis/index.js'

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

    /**
     * @deprecated User FireflyTwitter instead
     */
    static async getUserByScreenName(screenName: string): Promise<TwitterBaseAPI.User | null> {
        if (!screenName) return null
        return getUserByScreenName(screenName)
    }

    static async staleUserByScreenName(screenName: string): Promise<void> {
        await staleUserByScreenName(screenName)
    }

    static async createTweet(tweet: TwitterBaseAPI.Tweet) {
        const response = await createTweet(tweet)
        return response.rest_id
    }
}
