import type { Permissions } from 'webextension-polyfill'
import { MaskMessages } from '@masknet/shared-base'
import { getPermissionRequestURL } from '../../../shared/definitions/routes.js'
import type { SiteAdaptor } from '../../../shared/site-adaptors/types.js'

export async function requestExtensionPermission(permission: Permissions.Permissions): Promise<boolean> {
    if (await browser.permissions.contains(permission)) return true
    try {
        return await browser.permissions.request(permission).then(sendNotification)
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
            browser.permissions.contains(permission).then(sendNotification).then(resolve)
            browser.windows.onRemoved.removeListener(listener)
        })
    })
}

function sendNotification(result: boolean) {
    if (result) MaskMessages.events.hostPermissionChanged.sendToAll()
    return result
}
export async function requestHostPermission(origins: readonly string[]) {
    const currentOrigins = (await browser.permissions.getAll()).origins || []
    const extra = origins.filter((i) => !currentOrigins?.includes(i))
    if (!extra.length) return true
    return requestExtensionPermission({ origins: extra })
}

export function hasHostPermission(origins: readonly string[]) {
    return browser.permissions.contains({ origins: [...origins] })
}

export function queryExtensionPermission(permission: Permissions.AnyPermissions): Promise<boolean> {
    return browser.permissions.contains(permission)
}

/** @internal */
export function requestSiteAdaptorsPermission(defines: readonly SiteAdaptor.Definition[]) {
    return requestExtensionPermission({
        origins: defines.map((x) => x.declarativePermissions.origins).flat(),
    })
}
