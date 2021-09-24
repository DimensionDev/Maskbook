// This interface uses by-name style JSON RPC.
/**
 * Methods starts with "SNSAdaptor_" can only be called in SNS Adaptor.
 * Other methods can only be called in the background page.
 */
type ProfileIdentifier_string = string
type PersonaIdentifier_string = string
export interface MaskNetworkAPIs {
    /**
     * Echo the message back.
     */
    web_echo<T>(params: { echo: T }): Promise<T>
    /**
     * @returns A fully quantified URL in forms of
     * "holoflows-extension://...." or "moz-extension://...." (based on the platform)
     */
    getDashboardURL(): Promise<string>

    /**
     * @returns A stringified JSON string.
     * @example [[{ network: "twitter.com", connected: false } ]]
     */
    getConnectedPersonas(): Promise<string>
    app_isPluginEnabled(params: { pluginID: string }): Promise<boolean>
    app_setPluginStatus(params: { pluginID: string; enabled: boolean }): Promise<void>
    setting_getNetworkTraderProvider(params: { network: NetworkType }): Promise<TradeProvider | undefined>
    setting_setNetworkTraderProvider(params: { network: NetworkType; provider: TradeProvider }): Promise<void>
    settings_getTrendingDataSource(): Promise<DataProvider>
    settings_setTrendingDataSource(params: { provider: DataProvider }): Promise<void>
    settings_getLaunchPageSettings(): Promise<LaunchPage>
    settings_getTheme(): Promise<Appearance>
    settings_setTheme(params: { theme: Appearance }): Promise<void>
    settings_getLanguage(): Promise<LanguageOptions>
    settings_setLanguage(params: { language: LanguageOptions }): Promise<void>
    settings_createBackupJson(params: Partial<BackupOptions>): Promise<unknown>
    settings_getBackupPreviewInfo(params: { backupInfo: string }): Promise<BackupPreview | undefined>
    settings_restoreBackup(params: { backupInfo: string }): Promise<void>
    persona_createPersonaByMnemonic(params: { mnemonic: string; nickname: string; password: string }): Promise<Persona>
    persona_queryPersonas(params: { identifier?: PersonaIdentifier_string; hasPrivateKey: boolean }): Promise<Persona[]>
    persona_queryMyPersonas(params: { network?: string }): Promise<Persona[]>
    persona_updatePersonaInfo(params: {
        identifier: PersonaIdentifier_string
        data: { nickname: string }
    }): Promise<void>
    persona_removePersona(params: { identifier: PersonaIdentifier_string }): Promise<void>
    persona_restoreFromJson(params: { backup: string }): Promise<void>
    persona_restoreFromBase64(params: { backup: string }): Promise<void>
    persona_connectProfile(params: {
        profileIdentifier: ProfileIdentifier_string
        personaIdentifier: PersonaIdentifier_string
    }): Promise<void>
    persona_disconnectProfile(params: { identifier: ProfileIdentifier_string }): Promise<void>
    persona_backupMnemonic(params: { identifier: PersonaIdentifier_string }): Promise<string | undefined>
    persona_backupBase64(params: { identifier: PersonaIdentifier_string }): Promise<string>
    persona_backupJson(params: { identifier: PersonaIdentifier_string }): Promise<unknown>
    persona_backupPrivateKey(params: { identifier: PersonaIdentifier_string }): Promise<string | undefined>
    profile_queryProfiles(params: { network: string }): Promise<Profile[]>
    profile_queryMyProfiles(params: { network: string }): Promise<Profile[]>
    profile_updateProfileInfo(params: {
        identifier: ProfileIdentifier_string
        data: { nickname?: string; avatarURL?: string }
    }): Promise<void>
    profile_removeProfile(params: { identifier: ProfileIdentifier_string }): Promise<void>
    wallet_updateEthereumAccount(params: { account: string }): Promise<void>
    wallet_updateEthereumChainId(params: { chainId: number }): Promise<void>
    SNSAdaptor_getCurrentDetectedProfile(): Promise<ProfileIdentifier_string | undefined>
}

export interface Profile {
    identifier: string
    nickname?: string
    linkedPersona: boolean
    /** Unix timestamp */
    createdAt: number
    /** Unix timestamp */
    updatedAt: number
}

export interface ProfileState {
    [key: string]: 'pending' | 'confirmed'
}

export interface Persona {
    identifier: string
    nickname?: string
    linkedProfiles: ProfileState
    hasPrivateKey: boolean
    /** Unix timestamp */
    createdAt: number
    /** Unix timestamp */
    updatedAt: number
}

export interface BackupOptions {
    noPosts: boolean
    noWallets: boolean
    noPersonas: boolean
    noProfiles: boolean
    hasPrivateKeyOnly: boolean
}

export interface BackupPreview {
    personas: number
    accounts: number
    posts: number
    contacts: number
    files: number
    wallets: number
}

export enum Appearance {
    default = 'default',
    light = 'light',
    dark = 'dark',
}

export enum LaunchPage {
    facebook = 'facebook',
    twitter = 'twitter',
    dashboard = 'dashboard',
}

// This type MUST be sync with NetworkType in packages/web3-shared/src/types/index.ts
export enum NetworkType {
    Ethereum = 'Ethereum',
    Binance = 'Binance',
    Polygon = 'Polygon',
    Arbitrum = 'Arbitrum',
    xDai = 'xDai',
}

export enum DataProvider {
    COIN_GECKO = 0,
    COIN_MARKET_CAP = 1,
    UNISWAP_INFO = 2,
}

export enum TradeProvider {
    UNISWAP_V2 = 0,
    ZRX = 1,
    SUSHISWAP = 2,
    SASHIMISWAP = 3,
    BALANCER = 4,
    QUICKSWAP = 5,
    PANCAKESWAP = 6,
    DODO = 7,
    UNISWAP_V3 = 8,
    BANCOR = 9,
}
/** Supported language settings */
export enum LanguageOptions {
    __auto__ = 'auto',
    enUS = 'en-US',
    zhCN = 'zh-CN',
    zhTW = 'zh-TW',
    koKR = 'ko-KR',
    jaJP = 'ja-JP',
    esES = 'es-ES',
    faIR = 'fa-IR',
    itIT = 'it-IT',
    ruRU = 'ru-RU',
    frFR = 'fr-FR',
}

/** Supported display languages */
export enum SupportedLanguages {
    enUS = 'en-US',
    zhCN = 'zh-CN',
    zhTW = 'zh-TW',
    koKR = 'ko-KR',
    jaJP = 'ja-JP',
    esES = 'es-ES',
    faIR = 'fa-IR',
    itIT = 'it-IT',
    ruRU = 'ru-RU',
    frFR = 'fr-FR',
}
