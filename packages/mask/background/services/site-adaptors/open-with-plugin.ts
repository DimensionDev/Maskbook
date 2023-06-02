import type { Storage } from 'webextension-polyfill'

const key = 'openSNSAndActivatePlugin'
// Note: sessionStorage is only available in MV2 or MV3 page mode.
const sessionStorage: Storage = (globalThis as any).sessionStorage
/**
 * This function will open a new web page, then open the composition dialog and activate the composition entry of the given plugin.
 * @param url URL to open
 * @param pluginID Plugin to activate
 */
export async function openSNSAndActivatePlugin(url: string, pluginID: string): Promise<void> {
    await browser.tabs.create({ active: true, url })
    if (!('session' in browser.storage)) {
        sessionStorage.setItem(key, pluginID)
    } else {
        const session = browser.storage.session as Storage.StorageArea
        await session.set({ [key]: pluginID })
    }
}
export async function getDesignatedAutoStartPluginID(): Promise<string | null> {
    if (!('session' in browser.storage)) {
        const val = sessionStorage.getItem(key)
        sessionStorage.removeItem(key)
        return val
    } else {
        const session = browser.storage.session as Storage.StorageArea
        const val = await session.get(key)
        await session.remove(key)
        return (val[key] as string) ?? null
    }
}
