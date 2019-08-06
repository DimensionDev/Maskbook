import { merge } from 'lodash-es'

interface Storage {
    forceDisplayWelcome: boolean
    userIgnoredWelcome: boolean
}
export function getStorage(network: string): Promise<Partial<Storage>> {
    if (typeof browser === 'undefined' || !browser.storage) return {} as any
    return browser.storage.local.get(network)
}
export async function setStorage(network: string, item: Partial<Storage>) {
    if (typeof browser === 'undefined' || !browser.storage) return
    const storage = await getStorage(network)
    return browser.storage.local.set({
        [network]: merge(storage, item),
    })
}
