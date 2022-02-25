import { PopupRoutes } from '@masknet/shared-base'
export function getPopupRouteURLWithNoParam(kind: PopupRoutes) {
    return browser.runtime.getURL(`/popups.html#${kind}`)
}
export function getPermissionRequestURL(permission: browser.permissions.Permissions) {
    const { origins = [], permissions = [] } = permission
    const params = new URLSearchParams()
    for (const each of origins) params.append('origins', each)
    for (const each of permissions) params.append('permissions', each)
    return `${getPopupRouteURLWithNoParam(PopupRoutes.RequestPermission)}?${params.toString()}`
}
