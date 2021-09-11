import { apply, dispatchEvent, no_xray_Event } from './intrinsic'

namespace TwitterSettings {
    export interface TwitterUserSettingsLocal {
        autoPollNewTweets: boolean
        highContrastEnabled: boolean
        loginPromptLastShown: number
        nextPushCheckin: number
        preciseLocationEnabled: boolean
        reducedMotionEnabled: boolean
        scale: 'xSmall' | 'small' | 'normal' | 'large' | 'xLarge'
        shouldAutoPlayGif: boolean
        showTweetMediaDetailDrawer: boolean
        themeBackground: 'light' | 'dark' | 'darker'
    }

    export interface TwitterUserSettings {
        local: TwitterUserSettingsLocal
        _lastPersisted: number
    }

    const TWITTER_LOCALFORAGE_DB_VERSION = 2

    export async function getTwitterUserSettings() {
        return new Promise<TwitterUserSettings>((resolve, reject) => {
            const open = indexedDB.open('localforage', TWITTER_LOCALFORAGE_DB_VERSION)

            open.onsuccess = function () {
                const db = open.result
                const tx = db.transaction('keyvaluepairs', 'readwrite')
                const store = tx.objectStore('keyvaluepairs')
                const getSettings = store.get('device:rweb.settings')

                getSettings.onsuccess = () => {
                    resolve(getSettings.result)
                }

                getSettings.onerror = (error) => {
                    reject(error)
                }

                tx.oncomplete = () => {
                    db.close()
                }
            }
            open.onerror = (error) => {
                reject(error)
            }
        })
    }

    export function watchTwitterUserSettings() {
        // the count of running tasks
        let tasks = 0
        const dispatchUserSettings = async () => {
            tasks += 1
            // a task is already emitted
            if (tasks > 1) return
            try {
                const userSettings = await getTwitterUserSettings()
                apply(dispatchEvent, window, [
                    new no_xray_Event<TwitterUserSettings>('settingschange', {
                        detail: userSettings,
                    }),
                ])
            } catch {
                // do nothing
            } finally {
                if (tasks > 1) return
                tasks = 1
                dispatchUserSettings()
            }
        }
        dispatchUserSettings()
        window.addEventListener('load', dispatchUserSettings)
        window.addEventListener('locationchange', dispatchUserSettings)
    }
}

function main() {
    if (location.host.includes('twitter.com')) TwitterSettings.watchTwitterUserSettings()
}

main()

export {}
