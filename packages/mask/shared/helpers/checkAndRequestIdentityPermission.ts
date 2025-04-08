import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'
import type { Manifest } from 'webextension-polyfill'

export async function checkAndRequestPermission() {
    if (!isEnvironment(Environment.ExtensionProtocol) && !isEnvironment(Environment.ManifestBackground)) {
        // The User Activation limitation is from Firefox
        throw new Error(
            'browser.permissions.request can only be called after a User Activation and from a chrome-extension:// protocol.',
        )
    }
    const contained = await browser.permissions.contains({ permissions: ['identity'] })
    if (!contained) {
        const granted = await browser.permissions.request({ permissions: ['identity' as Manifest.OptionalPermission] })
        if (!granted) return
    }
    return true
}
