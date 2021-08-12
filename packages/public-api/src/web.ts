export interface MaskNetworkAPIs {
    web_echo<T>(arg: T): Promise<T>
    /**
     * @returns A fully quantified URL in forms of "holoflows-extension://...." or "moz-extension://...." (based on the platform)
     */
    getDashboardURL(): Promise<string>

    /**
     * @deprecated Use settings_getLaunchPageSettings()
     */
    getSettings(key: 'launchPageSettings'): Promise<LaunchPage>

    /**
     * @returns A stringified JSON string.
     * @example [[{ network: "twitter.com", connected: false } ]]
     */
    getConnectedPersonas(): Promise<string>
    app_isPluginEnabled(payload: { pluginID: string }): Promise<boolean>
    app_setPluginStatus(payload: { pluginID: string; enabled: boolean }): Promise<void>
    setting_getNetworkTraderProvider(payload: { network: NetworkType }): Promise<TradeProvider | undefined>
    setting_setNetworkTraderProvider(payload: { network: NetworkType; provider: TradeProvider }): Promise<void>
    settings_getTrendingDataSource(): Promise<DataProvider>
    settings_setTrendingDataSource(payload: { provider: DataProvider }): Promise<void>
    settings_getLaunchPageSettings(): Promise<LaunchPage>
    settings_getTheme(): Promise<Appearance>
    settings_setTheme(payload: { theme: Appearance }): Promise<void>
    settings_getLanguage(): Promise<Language>
    settings_setLanguage(payload: { language: Language }): Promise<void>
    persona_createPersonaByMnemonic(payload: { mnemonic: string; nickname: string; password: string }): Promise<any>
    persona_queryPersonas(payload: { identifier: string; hasPrivateKey: boolean }): Promise<any>
    persona_queryMyPersonas(payload: { network: string }): Promise<any>
    persona_updatePersonaInfo(payload: { identifier: string; data: { nickname: string } }): Promise<void>
    persona_removePersona(payload: { identifier: string }): Promise<void>
    persona_restoreFromJson(payload: { backup: string }): Promise<any>
    persona_restoreFromBase64(payload: { backup: string }): Promise<any>
    persona_restoreFromMnemonic(payload: { mnemonic: string; nickname: string; password: string }): Promise<any>
    persona_connectProfile(payload: {
        network: string
        profileUsername: string
        personaIdentifier: string
    }): Promise<void>
    persona_disconnectProfile(payload: { profileUsername: string; network: string }): Promise<void>
    persona_backupMnemonic(payload: { identifier: string }): Promise<any>
    persona_backupBase64(payload: { identifier: string }): Promise<string>
    persona_backupJson(payload: { identifier: string }): Promise<any>
    profile_queryProfiles(payload: { network: string }): Promise<any>
    profile_queryMyProfile(payload: { network: string }): Promise<any>
    profile_updateProfileInfo(payload: {
        identifier: string
        data: { nickname?: string; avatarURL?: string }
    }): Promise<void>
    profile_removeProfile(payload: { identifier: string }): Promise<void>
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
