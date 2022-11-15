import { TwitterBaseAPI } from '../../types/index.js'

const DB_NAME = 'localforage'
const DB_VERSION = 2

export async function getUserSettings() {
    const databases = await indexedDB.databases()
    if (!databases.some((x) => x.name === DB_NAME && x.version === DB_VERSION)) return

    return new Promise<TwitterBaseAPI.UserSettings | undefined>(async (resolve, reject) => {
        /* cspell:disable-next-line */
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.addEventListener('success', () => {
            const db = request.result
            /* cspell:disable-next-line */
            const transaction = db.transaction(['keyvaluepairs'], 'readonly')
            /* cspell:disable-next-line */
            const objectStore = transaction.objectStore('keyvaluepairs')
            /* cspell:disable-next-line */
            const query = objectStore.get('device:rweb.settings')

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

export function getDefaultUserSettings(): TwitterBaseAPI.UserSettings {
    return {
        scale: TwitterBaseAPI.Scale.Normal,
        themeBackground: TwitterBaseAPI.ThemeMode.Light,
        themeColor: TwitterBaseAPI.ThemeColor.Blue,
    }
}
