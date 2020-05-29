import { merge } from 'lodash-es'

interface Storage {
    forceDisplayWelcome: boolean
    userIgnoredWelcome: boolean
}
export async function getStorage(network: string): Promise<Partial<Storage>> {
    if (typeof browser === 'undefined' || !browser.storage) return {}
    const storage = await browser.storage.local.get(network)
    return ((storage ?? {})[network] ?? {}) as Partial<Storage>
}

export async function setStorage(network: string, item: Partial<Storage>) {
    if (typeof browser === 'undefined' || !browser.storage) return
    const storage = await getStorage(network)
    return browser.storage.local.set({
        [network]: merge(storage, item),
    })
}
