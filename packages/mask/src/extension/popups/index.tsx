import type { MaskSDK_SNS_ContextIdentifier } from '../../plugins/External/sns-context.js'
import { PopupRoutes } from '@masknet/shared-base'
import { getPopupRouteURLWithNoParam } from '../../../shared/definitions/routes.js'

export function PermissionAwareRedirectOf(url: string, context: MaskSDK_SNS_ContextIdentifier) {
    return (
        getPopupRouteURLWithNoParam(PopupRoutes.PermissionAwareRedirect) +
        `?url=${encodeURIComponent(url)}&context=${context}`
    )
}
export { getPermissionRequestURL, getPopupRouteURLWithNoParam } from '../../../shared/definitions/routes.js'
