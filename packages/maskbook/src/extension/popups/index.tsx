import type { ThirdPartyPopupContextIdentifier } from '../../plugins/External/popup-context'

export enum DialogRoutes {
    Root = '/',
    Wallet = '/wallet',
    ImportWallet = '/wallet/import',
    AddDeriveWallet = '/wallet/addDerive',
    Personas = '/personas',
    PermissionAwareRedirect = '/redirect',
    RequestPermission = '/request-permission',
    ThirdPartyRequestPermission = '/3rd-request-permission',
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
