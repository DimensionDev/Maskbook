import type { ThirdPartyPopupContextIdentifier } from '../../plugins/External/popup-context'

export enum DialogRoutes {
    PermissionAwareRedirect = '/redirect',
    RequestPermission = '/request-permission',
    ThirdPartyRequestPermission = '/3rd-request-permission',
    SignRequest = '/sign-request',
}

export function getRouteURLWithNoParam(kind: DialogRoutes) {
    return browser.runtime.getURL(`/popups.html#${kind}`)
}
export function PermissionAwareRedirectOf(url: string, context: ThirdPartyPopupContextIdentifier) {
    return (
        getRouteURLWithNoParam(DialogRoutes.PermissionAwareRedirect) +
        `?url=${encodeURIComponent(url)}&context=${context}`
    )
}
export { constructRequestPermissionURL } from './RequestPermission/utils'
export { constructSignRequestURL } from './SignRequest/utils'
