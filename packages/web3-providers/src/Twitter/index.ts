import { timeout } from '@masknet/kit'
import type { TwitterBaseAPI } from '../entry-types.js'
import {
    createTweet,
    getComputedUserSettings,
    getDefaultUserSettings,
    getSettings,
    getUserSettings,
    updateProfileImage,
    uploadMedia,
} from './apis/index.js'

export const Twitter = {
    getAvatarId(avatarURL?: string) {
        if (!avatarURL) return ''
        const match = /^\/profile_images\/(\d+)/u.exec(new URL(avatarURL).pathname)
        return match ? match[1] : ''
    },

    getSettings() {
        return getSettings()
    },

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
    },

    async uploadMedia(image: File | Blob): Promise<TwitterBaseAPI.MediaResponse> {
        return uploadMedia(image)
    },

    async updateProfileImage(screenName: string, media_id_str: string): Promise<TwitterBaseAPI.AvatarInfo | undefined> {
        return updateProfileImage(screenName, media_id_str)
    },

    async createTweet(tweet: TwitterBaseAPI.Tweet) {
        const response = await createTweet(tweet)
        return response.rest_id
    },
}
