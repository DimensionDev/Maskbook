import { getPermissionRequestURL } from '../../../shared/definitions/routes'
import { Flags } from '../../../shared/flags'
import type { SiteAdaptor } from '../../../shared/site-adaptors/types'
export async function requestExtensionPermission(permission: browser.permissions.Permissions): Promise<boolean> {
    if (Flags.no_web_extension_dynamic_permission_request) return true
    if (await browser.permissions.contains(permission)) return true
    try {
        return await browser.permissions.request(permission)
    } catch {
        // which means we're on Firefox or Manifest V3.
        // Chrome Manifest v2 allows permission request from the background.
    }
    const popup = await browser.windows.create({
        height: 600,
        width: 350,
        type: 'popup',
        url: getPermissionRequestURL(permission),
    })
    return new Promise((resolve) => {
        browser.windows.onRemoved.addListener(function listener(windowID: number) {
            if (windowID !== popup.id) return
            resolve(browser.permissions.contains(permission))
            browser.windows.onRemoved.removeListener(listener)
        })
    })
}

export async function requestHostPermission(origins: readonly string[]) {
    const currentOrigins = (await browser.permissions.getAll()).origins || []
    const extra = origins.filter((i) => !currentOrigins?.includes(i))
    if (!extra.length) return true
    return requestExtensionPermission({ origins: extra })
}

export function queryExtensionPermission(permission: browser.permissions.Permissions): Promise<boolean> {
    return browser.permissions.contains(permission)
}

/** @internal */
export function requestSiteAdaptorsPermission(defines: readonly SiteAdaptor.Definition[]) {
    return requestExtensionPermission({
        origins: defines.map((x) => x.declarativePermissions.origins).flat(),
    })
}
