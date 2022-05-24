const key = 'openSNSAndActivatePlugin'
/**
 * This function will open a new web page, then open the composition dialog and activate the composition entry of the given plugin.
 * @param url URL to open
 * @param pluginID Plugin to activate
 */
export async function openSNSAndActivatePlugin(url: string, pluginID: string) {
    await browser.tabs.create({ active: true, url })
    sessionStorage.setItem(key, pluginID)
}
export async function getDesignatedAutoStartPluginID() {
    const val = sessionStorage.getItem(key)
    sessionStorage.removeItem(key)
    return val
}
