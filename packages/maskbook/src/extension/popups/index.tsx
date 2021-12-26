import type { MaskSDK_SNS_ContextIdentifier } from '../../plugins/External/sns-context'
import { PopupRoutes } from '@masknet/shared-base'

export { PopupRoutes } from '@masknet/shared-base'

export function getRouteURLWithNoParam(kind: PopupRoutes) {
    return browser.runtime.getURL(`/popups.html#${kind}`)
}
export function PermissionAwareRedirectOf(url: string, context: MaskSDK_SNS_ContextIdentifier) {
    return (
        getRouteURLWithNoParam(PopupRoutes.PermissionAwareRedirect) +
        `?url=${encodeURIComponent(url)}&context=${context}`
    )
}
export { constructRequestPermissionURL } from './RequestPermission/utils'
export { constructSignRequestURL } from './SignRequest/utils'
