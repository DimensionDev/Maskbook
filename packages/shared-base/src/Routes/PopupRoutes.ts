export enum PopupRoutes {
    Root = '/',
    Wallet = '/wallet',
    ImportWallet = '/wallet/import',
    AddDeriveWallet = '/wallet/addDerive',
    WalletSettings = '/wallet/settings',
    WalletRename = '/wallet/rename',
    DeleteWallet = '/wallet/delete',
    CreateWallet = '/wallet/create',
    SwitchWallet = '/wallet/switch',
    SelectWallet = '/wallet/select',
    WalletRecovered = '/wallet/recovered',
    LegacyWalletRecovered = '/wallet/legacy-recovered',
    BackupWallet = '/wallet/backup',
    AddToken = '/wallet/addToken',
    WalletSignRequest = '/wallet/sign',
    GasSetting = '/wallet/gas',
    TokenDetail = '/wallet/tokenDetail',
    ContractInteraction = '/wallet/contract-interaction',
    Unlock = '/wallet/unlock',
    Transfer = '/wallet/transfer',
    SetPaymentPassword = '/wallet/password',
    ReplaceTransaction = '/wallet/replace',
    Personas = '/personas',
    Logout = '/personas/logout',
    PersonaRename = '/personas/rename',
    PermissionAwareRedirect = '/redirect',
    RequestPermission = '/request-permission',
    ThirdPartyRequestPermission = '/3rd-request-permission',
    SignRequest = '/sign-request',
    PersonaSignRequest = '/persona/sign-request',
    Swap = '/swap',
}
