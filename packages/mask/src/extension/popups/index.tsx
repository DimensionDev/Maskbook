import { PopupRoutes } from '@masknet/shared-base'
import { type MaskSDK_Site_ContextIdentifier } from '@masknet/plugin-external'
import { getPopupRouteURLWithNoParam } from '../../../shared/definitions/routes.js'

export function PermissionAwareRedirectOf(url: string, context: MaskSDK_Site_ContextIdentifier) {
    return (
        getPopupRouteURLWithNoParam(PopupRoutes.PermissionAwareRedirect) +
        `?url=${encodeURIComponent(url)}&context=${context}`
    )
}
export { getPermissionRequestURL, getPopupRouteURLWithNoParam } from '../../../shared/definitions/routes.js'
