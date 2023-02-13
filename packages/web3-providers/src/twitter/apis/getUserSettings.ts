import { TwitterBaseAPI } from '../../types/Twitter.js'
import { getStore } from './getDatabase.js'

/* cspell:disable-next-line */
const STORE_NAME = 'keyvaluepairs'
/* cspell:disable-next-line */
const KEY_NAME = 'device:rweb.settings'

export async function getUserSettings() {
    const store = await getStore(STORE_NAME)
    const query = store.get(KEY_NAME)

    return new Promise<TwitterBaseAPI.UserSettings | undefined>(async (resolve, reject) => {
        query.addEventListener('success', (event) => {
            if (!event.target) reject('Failed to get user settings.')

            const event_ = event as unknown as TwitterBaseAPI.Event<{
                local: TwitterBaseAPI.UserSettings
            }>

            resolve(event_.target.result.local)
        })
        query.addEventListener('error', (error) => {
            reject(error)
        })
    })
}

export function getDefaultUserSettings(): TwitterBaseAPI.UserSettings {
    return {
        scale: TwitterBaseAPI.Scale.Normal,
        themeBackground: TwitterBaseAPI.ThemeMode.Light,
        themeColor: TwitterBaseAPI.ThemeColor.Blue,
    }
}
