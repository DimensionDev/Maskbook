import { TwitterBaseAPI } from '../../types/index.js'

export async function getUserSettings() {
    return new Promise<TwitterBaseAPI.UserSettings | undefined>((resolve, reject) => {
        /* cspell:disable-next-line */
        const request = indexedDB.open('localforage', 2)

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
        scale: TwitterBaseAPI.Scale.normal,
        themeBackground: TwitterBaseAPI.ThemeMode.light,
        themeColor: TwitterBaseAPI.ThemeColor.blue,
    }
}
