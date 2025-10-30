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
    CreateMaskWalletForm = '/create-mask-wallet/form',
    CreateFireflyWallet = '/create-mask-wallet/firefly',
    RecoveryMaskWallet = '/create-mask-wallet/recovery',
    CreateMaskWalletMnemonic = '/create-mask-wallet/mnemonic',
    AddDeriveWallet = '/create-mask-wallet/add-derive-wallet',
    SignUpMaskWalletOnboarding = '/create-mask-wallet/onboarding',
}

export enum PopupModalRoutes {
    ChooseCurrency = '/choose-currency',
    ChooseNetwork = '/choose-network',
    SwitchWallet = '/switch-wallet',
    ConnectSocialAccount = '/connect-social-account',
    SelectProvider = '/select-provider',
    ConnectProvider = '/connect-provider',
    UpdatePermissions = '/modal/update-permission',
    SwitchPersona = '/switch-persona',
    PersonaSettings = '/persona-setting',
    PersonaRename = '/persona-rename',
    SetBackupPassword = '/set-backup-password',
    verifyBackupPassword = '/verify-backup-password',
    WalletAccount = '/wallet-accounts',
    SelectLanguage = '/select-language',
    SelectAppearance = '/select-appearance',
    SupportedSitesModal = '/supported-sites',
    ChangeBackupPassword = '/change-backup-password',
}

export enum PopupRoutes {
    Wallet = '/wallet',
    WalletUnlock = '/wallet/unlock',
    WalletStartUp = '/wallet/startup',
    WalletSettings = '/wallet/settings',
    CreateWallet = '/wallet/create',
    DeriveWallet = '/wallet/derive',
    SelectWallet = '/wallet/select',
    AddToken = '/wallet/addToken',
    GasSetting = '/wallet/gas',
    TokenDetail = '/wallet/token-detail',
    TransactionDetail = '/wallet/transaction-detail',
    CollectibleDetail = '/wallet/collectible-detail',
    ContractInteraction = '/wallet/contract-interaction',
    ResetWallet = '/wallet/reset-wallet',
    Transfer = '/wallet/transfer',
    Contacts = '/wallet/contacts',
    SetPaymentPassword = '/wallet/password',
    NetworkManagement = '/wallet/network-management',
    EditNetwork = '/wallet/edit-network',
    AddNetwork = '/wallet/add-network',
    Receive = '/wallet/receive',
    ExportWalletPrivateKey = '/wallet/export-private-key',
    ConnectedSites = '/wallet/connected-sites',
    Personas = '/personas',
    Logout = '/personas/logout',
    AccountDetail = '/personas/accounts/detail',
    ConnectWallet = '/personas/connect-wallet',
    PersonaSignRequest = '/personas/sign-request',
    RequestPermission = '/request-permission',
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
    [PopupRoutes.SelectWallet]: {
        chainId?: number
        address?: string
        source?: string
    }
    [PopupRoutes.Personas]: {
        providerType?: string
        tab: string
        from?: PopupModalRoutes
    }
    [PopupRoutes.SetPaymentPassword]: {
        isCreating?: boolean
        source?: string
    }
    [PopupRoutes.Wallet]: {
        isCreating?: boolean
        // Unlock
        close_after_unlock?: boolean
        from?: string | null
    }
    [PopupRoutes.WalletUnlock]: {
        close_after_unlock?: boolean
        from?: string | null
    }
    [PopupRoutes.Contacts]: { selectedToken: string | undefined }
    [PopupRoutes.CreateWallet]: { creatingFireflyWallet?: boolean }
}
