import { MessageCenter } from './messages'

export async function extraPermissions(origins: string[] | null) {
    if (!origins) return null
    const currentOrigins = (await browser.permissions.getAll()).origins || []
    const extra = origins.filter((i) => !currentOrigins?.includes(i))
    return extra.length ? extra : null
}

export function notifyPermissionUpdate(result: boolean) {
    if (result) MessageCenter.emit('permissionUpdated', void 0)
    return result
}
