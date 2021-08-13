// This interface uses by-name style JSON RPC.
export interface MaskNetworkAPIs {
    web_echo<T>(params: { echo: T }): Promise<T>
    /**
     * @returns A fully quantified URL in forms of "holoflows-extension://...." or "moz-extension://...." (based on the platform)
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
    settings_getLanguage(): Promise<Language>
    settings_setLanguage(params: { language: Language }): Promise<void>
    settings_createBackupJson(params: Partial<BackupOptions>): Promise<any>
    settings_getBackupPreviewInfo(params: string): Promise<any>
    settings_restoreBackup(params: string): Promise<void>
    persona_createPersonaByMnemonic(params: { mnemonic: string; nickname: string; password: string }): Promise<any>
    persona_queryPersonas(params: { identifier?: string; hasPrivateKey: boolean }): Promise<any>
    persona_queryMyPersonas(params: { network?: string }): Promise<any>
    persona_updatePersonaInfo(params: { identifier: string; data: { nickname: string } }): Promise<void>
    persona_removePersona(params: { identifier: string }): Promise<void>
    persona_restoreFromJson(params: { backup: string }): Promise<any>
    persona_restoreFromBase64(params: { backup: string }): Promise<any>
    persona_restoreFromMnemonic(params: { mnemonic: string; nickname: string; password: string }): Promise<any>
    persona_connectProfile(params: {
        network: string
        profileUsername: string
        personaIdentifier: string
    }): Promise<void>
    persona_disconnectProfile(params: { profileUsername: string; network: string }): Promise<void>
    persona_backupMnemonic(params: { identifier: string }): Promise<any>
    persona_backupBase64(params: { identifier: string }): Promise<string>
    persona_backupJson(params: { identifier: string }): Promise<any>
    profile_queryProfiles(params: { network: string }): Promise<any>
    profile_queryMyProfile(params: { network: string }): Promise<any>
    profile_updateProfileInfo(params: {
        identifier: string
        data: { nickname?: string; avatarURL?: string }
    }): Promise<void>
    profile_removeProfile(params: { identifier: string }): Promise<void>
}

export interface BackupOptions {
    noPosts: boolean
    noWallets: boolean
    noPersonas: boolean
    noProfiles: boolean
    hasPrivateKeyOnly: boolean
}

export enum Appearance {
    default = 'default',
    light = 'light',
    dark = 'dark',
}

export enum Language {
    zh = 'zh',
    en = 'en',
    ko = 'ko',
    ja = 'ja',
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
}

export enum DataProvider {
    COIN_GECKO = 0,
    COIN_MARKET_CAP = 1,
    UNISWAP_INFO = 2,
}

export enum TradeProvider {
    UNISWAP = 0,
    ZRX = 1,
    SUSHISWAP = 2,
    SASHIMISWAP = 3,
    BALANCER = 4,
    QUICKSWAP = 5,
    PANCAKESWAP = 6,
    DODO = 7,
}
