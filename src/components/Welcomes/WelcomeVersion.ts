{
    /**
     * Upgrade version from true to number.
     * Remove this after 1/1/2020
     */
    typeof browser === 'object' &&
        browser.storage &&
        browser.storage.local.get().then(items => {
            if (items.init === true) browser.storage.local.set({ init: WelcomeVersion.A })
        })
}
interface Storage {
    init: WelcomeVersion
    userDismissedWelcomeAtVersion: WelcomeVersion
}
export function getStorage(): Promise<Partial<Storage>> {
    return browser.storage.local.get()
}
export function setStorage(item: Partial<Storage>) {
    return browser.storage.local.set(item)
}
const enum WelcomeVersion {
    A = 1,
}
export const LATEST_WELCOME_VERSION = WelcomeVersion.A
