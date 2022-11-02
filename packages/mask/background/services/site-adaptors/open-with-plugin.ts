const key = 'openSNSAndActivatePlugin'
/**
 * This function will open a new web page, then open the composition dialog and activate the composition entry of the given plugin.
 * @param url URL to open
 * @param pluginID Plugin to activate
 */
export async function openSNSAndActivatePlugin(url: string, pluginID: string): Promise<void> {
    await browser.tabs.create({ active: true, url })
    if (process.env.manifest === '2') {
        ;(globalThis as any).sessionStorage.setItem(key, pluginID)
    } else {
        await browser.storage.session.set({ [key]: pluginID })
    }
}
export async function getDesignatedAutoStartPluginID(): Promise<string | null> {
    if (process.env.manifest === '2') {
        const val = (globalThis as any).sessionStorage.getItem(key)
        ;(globalThis as any).sessionStorage.removeItem(key)
        return val
    } else {
        const val = await browser.storage.session.get(key)
        await browser.storage.session.remove(key)
        return (val[key] as string) ?? null
    }
}
