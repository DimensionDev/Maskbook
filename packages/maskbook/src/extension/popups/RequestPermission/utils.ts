import { DialogRoutes, getRouteURLWithNoParam } from '..'

export function constructRequestPermissionURL(permission: browser.permissions.Permissions) {
    const { origins = [], permissions = [] } = permission
    const params = new URLSearchParams()
    for (const each of origins) params.append('origins', each)
    for (const each of permissions) params.append('permissions', each)
    return `${getRouteURLWithNoParam(DialogRoutes.RequestPermission)}?${params.toString()}`
}
