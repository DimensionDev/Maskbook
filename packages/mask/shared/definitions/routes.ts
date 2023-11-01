import { PopupRoutes } from '@masknet/shared-base'
import type { Permissions } from 'webextension-polyfill'

export function getPermissionRequestURL(permission: Permissions.Permissions) {
    const { origins = [], permissions = [] } = permission
    const params = new URLSearchParams()
    for (const each of origins) params.append('origins', each)
    for (const each of permissions) params.append('permissions', each)
    return `${browser.runtime.getURL(`/popups.html#${PopupRoutes.RequestPermission}`)}?${params.toString()}`
}
