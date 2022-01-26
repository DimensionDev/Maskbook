import type { MaskSDK_SNS_ContextIdentifier } from '../../plugins/External/sns-context'
import { PopupRoutes } from '@masknet/shared-base'

import { getRouteURLWithNoParam } from './utils'

export function PermissionAwareRedirectOf(url: string, context: MaskSDK_SNS_ContextIdentifier) {
    return (
        getRouteURLWithNoParam(PopupRoutes.PermissionAwareRedirect) +
        `?url=${encodeURIComponent(url)}&context=${context}`
    )
}
export { constructRequestPermissionURL } from './RequestPermission/utils'
export { getRouteURLWithNoParam } from './utils'
