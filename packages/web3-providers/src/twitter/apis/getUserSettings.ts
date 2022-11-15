import { getTokens } from './getTokens.js'
import type { TwitterBaseAPI } from '../../types/index.js'

export async function getUserSettings() {
    // only logged users
    const tokens = await getTokens()
    if (!tokens.bearerToken) return

    return new Promise<TwitterBaseAPI.UserSettings | undefined>((resolve, reject) => {
        const request = indexedDB.open('localforage', 2)

        request.onsuccess = () => {
            const db = request.result
            const transaction = db.transaction(['keyvaluepairs'], 'readonly')
            const objectStore = transaction.objectStore('keyvaluepairs')
            const query = objectStore.get('device:rweb.settings')

            query.onsuccess = (event) => {
                if (!event.target) reject('Failed to get user settings.')

                const event_ = event as unknown as TwitterBaseAPI.Event<TwitterBaseAPI.UserSettings>
                resolve(event_.target.result)
            }
            query.onerror = (error) => {
                reject(error)
            }
        }
        request.onerror = (error) => {
            reject(error)
        }
    })
}
