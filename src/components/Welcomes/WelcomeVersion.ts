interface Storage {
    userDismissedWelcome: boolean
}
export function getStorage(): Promise<Partial<Storage>> {
    if (typeof browser === 'undefined' || !browser.storage) return {} as any
    return browser.storage.local.get()
}
export function setStorage(item: Partial<Storage>) {
    if (typeof browser === 'undefined' || !browser.storage) return {} as any
    return browser.storage.local.set(item)
}
