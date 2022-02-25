import { PopupRoutes } from '@masknet/shared-base'
import { getPopupRouteURLWithNoParam } from '..'
import type { ThirdPartyPluginPermission } from '../../background-script/ThirdPartyPlugin/types'

export function constructThirdPartyRequestPermissionURL(
    pluginManifestURL: string,
    permissions: ThirdPartyPluginPermission[],
) {
    const params = new URLSearchParams()
    params.set('plugin', pluginManifestURL)
    for (const x of permissions) params.append('permission', String(x))
    return getPopupRouteURLWithNoParam(PopupRoutes.ThirdPartyRequestPermission) + '?' + params.toString()
}
