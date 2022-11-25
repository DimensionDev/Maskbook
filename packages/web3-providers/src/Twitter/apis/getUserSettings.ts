import { memoize } from 'lodash-es'
import { memoizePromise } from '@masknet/kit'
import { isFirefox } from '@masknet/shared-base'
import { TwitterBaseAPI } from '../../types/Twitter.js'

/* cspell:disable-next-line */
const DB_NAME = 'localforage'
const DB_VERSION = 2
/* cspell:disable-next-line */
const STORE_NAME = 'keyvaluepairs'
/* cspell:disable-next-line */
const KEY_NAME = 'device:rweb.settings'

export async function getUserSettings() {
    if (!isFirefox()) {
        const databases = await indexedDB.databases()
        if (!databases.some((x) => x.name === DB_NAME && x.version === DB_VERSION)) return
    }

    return new Promise<TwitterBaseAPI.UserSettings | undefined>(async (resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.addEventListener('success', () => {
            const db = request.result
            const transaction = db.transaction([STORE_NAME], 'readonly')
            const objectStore = transaction.objectStore(STORE_NAME)
            const query = objectStore.get(KEY_NAME)

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
        request.addEventListener('error', (error) => {
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
