export enum DashboardRoutes {
    Setup = '/setup',
    Welcome = '/setup/welcome',
    Permissions = '/setup/permissions',
    PermissionsOnboarding = '/setup/permissions/onboarding',
    SignUpPersona = '/setup/sign-up',

    Recovery = '/setup/recovery',
    RecoveryPhrase = '/setup/recovery/phrase',
    RecoveryPrivateKey = '/setup/recovery/private-key',
    RecoveryLocal = '/setup/recovery/local',
    RecoveryCloud = '/setup/recovery/cloud',
    RecoveryCloudGoogleDrive = '/setup/recovery/cloud/google-drive',

    SignUpPersonaMnemonic = '/setup/sign-up/mnemonic',
    SignUpPersonaOnboarding = '/setup/sign-up/onboarding',
    Backup = '/setup/backup',
    BackupLocal = '/setup/backup/local',
    BackupCloud = '/setup/backup/cloud',
    BackupCloudGoogleDrive = '/setup/backup/cloud/google-drive',
    BackupPreview = '/setup/backup/cloud/preview',

    SignUp = '/sign-up',
    SignIn = '/sign-in',
    Personas = '/personas',
    CreateMaskWallet = '/create-mask-wallet',
    CreateFireflyWallet = '/create-mask-wallet/firefly',
}

export enum PopupModalRoutes {
    ChooseCurrency = '/choose-currency',
    ChooseNetwork = '/choose-network',
    ConnectSocialAccount = '/connect-social-account',
    SelectProvider = '/select-provider',
    ConnectProvider = '/connect-provider',
    UpdatePermissions = '/modal/update-permission',
    SwitchPersona = '/switch-persona',
    PersonaSettings = '/persona-setting',
    PersonaRename = '/persona-rename',
    SetBackupPassword = '/set-backup-password',
    verifyBackupPassword = '/verify-backup-password',
    SelectLanguage = '/select-language',
    SelectAppearance = '/select-appearance',
    SupportedSitesModal = '/supported-sites',
    ChangeBackupPassword = '/change-backup-password',
}

export enum PopupRoutes {
    Wallet = '/wallet',
    AddToken = '/wallet/addToken',
    TokenDetail = '/wallet/token-detail',
    TransactionDetail = '/wallet/transaction-detail',
    ContractInteraction = '/wallet/contract-interaction',
    Transfer = '/wallet/transfer',
    Contacts = '/wallet/contacts',
    NetworkManagement = '/wallet/network-management',
    EditNetwork = '/wallet/edit-network',
    AddNetwork = '/wallet/add-network',
    Receive = '/wallet/receive',
    SyncTwitterCookies = '/wallet/sync-twitter-cookies',
    Personas = '/personas',
    Logout = '/personas/logout',
    AccountDetail = '/personas/accounts/detail',
    ConnectWallet = '/personas/connect-wallet',
    PersonaSignRequest = '/personas/sign-request',
    RequestPermission = '/request-permission',
    GetTwitterTokenByQR = '/twitter-token',
    Friends = '/friends',
    FriendsDetail = '/friends/detail',
    Settings = '/settings',
    WalletConnect = '/personas/wallet-connect',
    ExportPrivateKey = '/personas/export-private-key',
    PersonaAvatarSetting = '/personas/avatar-setting',
    Trader = '/trader',
}
export interface PopupRoutesParamsMap {
    [PopupRoutes.PersonaSignRequest]: {
        message: string
        requestID: string
        identifier: string | undefined
        source: string | undefined
    }
    [PopupRoutes.Personas]: {
        providerType?: string
        tab: string
        from?: PopupModalRoutes
    }
    [PopupRoutes.Contacts]: { selectedToken: string | undefined }
}
