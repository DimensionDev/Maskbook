interface Storage {
    userDismissedWelcome: boolean
}
export function getStorage(): Promise<Partial<Storage>> {
    return browser.storage.local.get()
}
export function setStorage(item: Partial<Storage>) {
    return browser.storage.local.set(item)
}
