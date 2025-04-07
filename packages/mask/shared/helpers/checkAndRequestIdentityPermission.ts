import type { Manifest } from 'webextension-polyfill'

export async function checkAndRequestPermission() {
    const contained = await browser.permissions.contains({ permissions: ['identity'] })
    if (!contained) {
        const granted = await browser.permissions.request({ permissions: ['identity' as Manifest.OptionalPermission] })
        if (!granted) return
    }
    return true
}
