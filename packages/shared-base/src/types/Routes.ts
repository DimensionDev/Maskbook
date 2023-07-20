export enum DashboardRoutes {
    Setup = '/setup',
    Welcome = '/setup/welcome',
    SignUpPersona = '/setup/sign-up',
    RecoveryPersona = '/setup/recovery',
    SignUpPersonaMnemonic = '/setup/sign-up/mnemonic',
    SignUpPersonaOnboarding = '/setup/sign-up/onboarding',
    SignUp = '/sign-up',
    SignIn = '/sign-in',
    PrivacyPolicy = '/privacy-policy',
    Personas = '/personas',
    Wallets = '/wallets',
    WalletsTransfer = '/wallets/transfer',
    WalletsSwap = '/wallets/swap',
    WalletsRedPacket = '/wallets/red-packet',
    WalletsSell = '/wallets/sell',
    WalletsHistory = '/wallets/history',
    CreateMaskWallet = '/create-mask-wallet',
    CreateMaskWalletForm = '/create-mask-wallet/form',
    RecoveryMaskWallet = '/create-mask-wallet/recovery',
    CreateMaskWalletMnemonic = '/create-mask-wallet/mnemonic',
    AddDeriveWallet = '/create-mask-wallet/add-derive-wallet',
    SignUpMaskWalletOnboarding = '/create-mask-wallet/onboarding',
    Settings = '/settings',
}

export enum PopupModalRoutes {
    ChooseNetwork = '/modal/choose-network',
    SwitchWallet = '/modal/switch-wallet',
    ConnectSocialAccount = '/modal/connect-social-account',
    SelectProvider = '/modal/select-provider',
    ConnectProvider = '/modal/connect-provider',
}

export enum PopupRoutes {
    Root = '/',
    Wallet = '/wallet',
    WalletStartUp = '/wallet/startup',
    ImportWallet = '/wallet/import',
    AddDeriveWallet = '/wallet/addDerive',
    WalletSettings = '/wallet/settings',
    WalletRename = '/wallet/rename',
    DeleteWallet = '/wallet/delete',
    CreateWallet = '/wallet/create',
    SelectWallet = '/wallet/select',
    LegacyWalletRecovered = '/wallet/legacy-recovered',
    BackupWallet = '/wallet/backup',
    AddToken = '/wallet/addToken',
    WalletSignRequest = '/wallet/sign',
    GasSetting = '/wallet/gas',
    TokenDetail = '/wallet/token-detail',
    TransactionDetail = '/wallet/transaction-detail',
    ContractInteraction = '/wallet/contract-interaction',
    ConfirmTransaction = '/wallet/confirm-transaction',
    Unlock = '/wallet/unlock',
    Transfer = '/wallet/transfer',
    Contacts = '/wallet/contacts',
    SetPaymentPassword = '/wallet/password',
    ReplaceTransaction = '/wallet/replace',
    NetworkManagement = '/wallet/network-management',
    EditNetwork = '/wallet/edit-network',
    AddNetwork = '/wallet/add-network',
    Receive = '/wallet/receive',
    Personas = '/personas',
    Logout = '/personas/logout',
    PersonaRename = '/personas/rename',
    SelectPersona = '/personas/select',
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
    Contracts = '/contracts',
    Settings = '/settings',
    WalletConnect = '/personas/wallet-connect',
}
