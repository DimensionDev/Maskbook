export const SessionStorageCache = {
    get(scope: string, key: string) {
        return sessionStorage.getItem(`${scope}:${key}`)
    },
    set(scope: string, key: string, value: string) {
        return sessionStorage.setItem(`${scope}:${key}`, value)
    },
    remove(scope: string, key: string) {
        return sessionStorage.removeItem(`${scope}:${key}`)
    },
}
