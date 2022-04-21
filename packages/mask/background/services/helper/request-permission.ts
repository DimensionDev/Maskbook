import { getPermissionRequestURL } from '../../../shared/definitions/routes'
export async function requestExtensionPermission(permission: browser.permissions.Permissions): Promise<boolean> {
    if (await browser.permissions.contains(permission)) return true
    try {
        return await browser.permissions.request(permission)
    } catch {
        // which means we're on Firefox.
        // Chrome allows permission request from the background.
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

export async function requestHostPermission(origins: string[]) {
    const currentOrigins = (await browser.permissions.getAll()).origins || []
    const extra = origins.filter((i) => !currentOrigins?.includes(i))
    if (!extra.length) return true
    return requestExtensionPermission({ origins: extra })
}

export function queryExtensionPermission(permission: browser.permissions.Permissions): Promise<boolean> {
    return browser.permissions.contains(permission)
}
