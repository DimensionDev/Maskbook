import { memoize } from 'lodash-es'
import { memoizePromise } from '@masknet/kit'
import { getStore } from './getDatabase.js'
import { TwitterBaseAPI } from '../../entry-types.js'

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

export const getUserSettingsCached = memoizePromise(memoize, getUserSettings, () => 'DEFAULT')

export function getDefaultUserSettings(): TwitterBaseAPI.UserSettings {
    return {
        scale: TwitterBaseAPI.Scale.Normal,
        themeBackground: TwitterBaseAPI.ThemeMode.Light,
        themeColor: TwitterBaseAPI.ThemeColor.Blue,
    }
}
