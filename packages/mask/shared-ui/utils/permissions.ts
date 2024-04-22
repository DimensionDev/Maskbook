import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'
import type { EnhanceableSite } from '@masknet/shared-base'
import { definedSiteAdaptors } from '../../shared/site-adaptors/definitions.js'

export async function requestPermissionFromExtensionPage(origins: readonly string[] | EnhanceableSite) {
    if (!isEnvironment(Environment.ExtensionProtocol) || isEnvironment(Environment.ManifestBackground)) {
        // The User Activation limitation is from Firefox
        throw new Error(
            'browser.permissions.request can only be called after a User Activation and from a chrome-extension:// protocol.',
        )
    }
    let o: string[]
    if (typeof origins === 'string') {
        const site = definedSiteAdaptors.get(origins)?.declarativePermissions.origins
        if (!site) return true
        o = [...site]
    } else {
        o = [...origins]
    }
    return browser.permissions.request({ origins: o })
}
