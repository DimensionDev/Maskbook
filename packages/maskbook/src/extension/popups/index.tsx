export enum DialogRoutes {
    PermissionAwareRedirect = '/redirect',
    RequestPermission = '/request-permission',
    ThirdPartyRequestPermission = '/3rd-request-permission',
}

export function getRouteURLWithNoParam(kind: DialogRoutes) {
    return browser.runtime.getURL(`/popups.html#${kind}`)
}
export function PermissionAwareRedirectOf(url: string) {
    return getRouteURLWithNoParam(DialogRoutes.PermissionAwareRedirect) + `?url=${encodeURIComponent(url)}`
}
export { constructRequestPermissionURL } from './RequestPermission/utils'
