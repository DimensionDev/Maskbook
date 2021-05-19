export enum DialogRoutes {
    RequestPermission = '/request-permission',
}

export function getRouteURLWithNoParam(kind: DialogRoutes) {
    return browser.runtime.getURL(`/popups.html#${kind}`)
}
export { constructRequestPermissionURL } from './RequestPermission/utils'
