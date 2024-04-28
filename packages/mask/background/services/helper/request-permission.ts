import type { Permissions } from 'webextension-polyfill'
import { waitUntil } from '@dimensiondev/holoflows-kit'
import { MaskMessages } from '@masknet/shared-base'
import { getPermissionRequestURL } from '../../../shared/definitions/routes.js'

export async function requestExtensionPermissionFromContentScript(
    permission: Permissions.Permissions,
): Promise<boolean> {
    if (await browser.permissions.contains(permission)) return true
    const popup = await browser.windows.create({
        height: 600,
        width: 400,
        type: 'popup',
        url: getPermissionRequestURL(permission),
    })
    const promise = new Promise<boolean>((resolve) => {
        browser.windows.onRemoved.addListener(function listener(windowID: number) {
            if (windowID !== popup.id) return
            browser.permissions.contains(permission).then(sendNotification).then(resolve)
            browser.windows.onRemoved.removeListener(listener)
        })
    })
    waitUntil(promise)
    return promise
}

function sendNotification(result: boolean) {
    if (result) MaskMessages.events.hostPermissionChanged.sendToAll()
    return result
}

export function hasHostPermission(origins: readonly string[]) {
    return browser.permissions.contains({ origins: [...origins] })
}

export function queryExtensionPermission(permission: Permissions.AnyPermissions): Promise<boolean> {
    return browser.permissions.contains(permission)
}
