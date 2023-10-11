export enum DashboardRoutes {
    Setup = '/setup',
    Welcome = '/setup/welcome',
    SignUpPersona = '/setup/sign-up',
    RecoveryPersona = '/setup/recovery',
    SignUpPersonaMnemonic = '/setup/sign-up/mnemonic',
    SignUpPersonaOnboarding = '/setup/sign-up/onboarding',
    LocalBackup = '/setup/local-backup',
    CloudBackup = '/setup/cloud-backup',
    CloudBackupPreview = '/setup/cloud-backup-preview',
    SignUp = '/sign-up',
    SignIn = '/sign-in',
    PrivacyPolicy = '/privacy-policy',
    Personas = '/personas',
    CreateMaskWallet = '/create-mask-wallet',
    CreateMaskWalletForm = '/create-mask-wallet/form',
    RecoveryMaskWallet = '/create-mask-wallet/recovery',
    CreateMaskWalletMnemonic = '/create-mask-wallet/mnemonic',
    AddDeriveWallet = '/create-mask-wallet/add-derive-wallet',
    SignUpMaskWalletOnboarding = '/create-mask-wallet/onboarding',
}

export enum PopupModalRoutes {
    ChooseCurrency = '/modal/choose-currency',
    ChooseNetwork = '/modal/choose-network',
    SwitchWallet = '/modal/switch-wallet',
    ConnectSocialAccount = '/modal/connect-social-account',
    SelectProvider = '/modal/select-provider',
    ConnectProvider = '/modal/connect-provider',
    SwitchPersona = '/modal/switch-persona',
    PersonaSettings = '/modal/persona-setting',
    PersonaRename = '/modal/persona-rename',
    SetBackupPassword = '/modal/set-backup-password',
    verifyBackupPassword = '/modal/verify-backup-password',
    WalletAccount = '/modal/wallet-accounts',
    SelectLanguage = '/modal/select-language',
    SelectAppearance = '/modal/select-appearance',
    SupportedSitesModal = '/modal/supported-sites',
    ChangeBackupPassword = '/modal/change-backup-password',
}

export enum PopupRoutes {
    Root = '/',
    Wallet = '/wallet',
    WalletStartUp = '/wallet/startup',
    AddDeriveWallet = '/wallet/addDerive',
    WalletSettings = '/wallet/settings',
    WalletRename = '/wallet/rename',
    DeleteWallet = '/wallet/delete',
    CreateWallet = '/wallet/create',
    DeriveWallet = '/wallet/derive',
    SelectWallet = '/wallet/select',
    BackupWallet = '/wallet/backup',
    AddToken = '/wallet/addToken',
    GasSetting = '/wallet/gas',
    TokenDetail = '/wallet/token-detail',
    TransactionDetail = '/wallet/transaction-detail',
    CollectibleDetail = '/wallet/collectible-detail',
    ContractInteraction = '/wallet/contract-interaction',
    ConfirmTransaction = '/wallet/confirm-transaction',
    ResetWallet = '/wallet/reset-wallet',
    Transfer = '/wallet/transfer',
    Contacts = '/wallet/contacts',
    SetPaymentPassword = '/wallet/password',
    ReplaceTransaction = '/wallet/replace',
    NetworkManagement = '/wallet/network-management',
    EditNetwork = '/wallet/edit-network',
    AddNetwork = '/wallet/add-network',
    Receive = '/wallet/receive',
    ExportWalletPrivateKey = '/wallet/export-private-key',
    ConnectedSites = '/wallet/connected-sites',
    Personas = '/personas',
    Logout = '/personas/logout',
    SocialAccounts = '/personas/accounts',
    AccountDetail = '/personas/accounts/detail',
    ConnectedWallets = '/personas/connected-wallets',
    ConnectWallet = '/personas/connect-wallet',
    PersonaSignRequest = '/personas/sign-request',
    PermissionAwareRedirect = '/redirect',
    RequestPermission = '/request-permission',
    ThirdPartyRequestPermission = '/3rd-request-permission',
    SignRequest = '/sign-request',
    Swap = '/swap',
    VerifyWallet = '/personas/verify',
    ChangeOwner = '/wallet/change-owner',
    Friends = '/friends',
    FriendsDetail = '/friends/detail',
    Settings = '/settings',
    WalletConnect = '/personas/wallet-connect',
    ExportPrivateKey = '/personas/export-private-key',
    PersonaAvatarSetting = '/personas/avatar-setting',
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
        external_request?: string
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
    [PopupRoutes.ContractInteraction]: {
        source?: string
    }
    [PopupRoutes.Wallet]: {
        isCreating?: boolean
        external_request?: string
        // Unlock
        close_after_unlock?: boolean
        from?: string | null
    }
    [PopupRoutes.ChangeOwner]: { contractAccount: string | undefined }
    [PopupRoutes.Contacts]: { selectedToken: string | undefined }
}
