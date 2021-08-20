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
    app_isPluginEnabled(pluginID: string): Promise<boolean>
    app_setPluginStatus(pluginID: string, enabled: boolean): Promise<void>
    setting_getNetworkTraderProvider(network: NetworkType): Promise<TradeProvider | undefined>
    setting_setNetworkTraderProvider(network: NetworkType, provider: TradeProvider): Promise<void>
    settings_getTrendingDataSource(): Promise<DataProvider>
    settings_setTrendingDataSource(provider: DataProvider): Promise<void>
    settings_getLaunchPageSettings(): Promise<LaunchPage>
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
    UNISWAP_V2 = 0,
    ZRX = 1,
    SUSHISWAP = 2,
    SASHIMISWAP = 3,
    BALANCER = 4,
    QUICKSWAP = 5,
    PANCAKESWAP = 6,
    DODO = 7,
    UNISWAP_V3 = 8,
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
