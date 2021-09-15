import type { MaskSDK_SNS_ContextIdentifier } from '../../plugins/External/sns-context'

export enum PopupRoutes {
    Root = '/',
    Wallet = '/wallet',
    ImportWallet = '/wallet/import',
    AddDeriveWallet = '/wallet/addDerive',
    WalletSettings = '/wallet/settings',
    WalletRename = '/wallet/rename',
    DeleteWallet = '/wallet/delete',
    CreateWallet = '/wallet/create',
    SelectWallet = '/wallet/select',
    BackupWallet = '/wallet/backup',
    AddToken = '/wallet/addToken',
    WalletSignRequest = '/wallet/sign',
    GasSetting = '/wallet/gas',
    TokenDetail = '/wallet/tokenDetail',
    ContractInteraction = '/wallet/contract-interaction',
    Unlock = '/wallet/unlock',
    Transfer = '/wallet/transfer',
    Personas = '/personas',
    Logout = '/personas/logout',
    PermissionAwareRedirect = '/redirect',
    RequestPermission = '/request-permission',
    ThirdPartyRequestPermission = '/3rd-request-permission',
    SignRequest = '/sign-request',
}

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
