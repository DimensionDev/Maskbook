import type { PersonaRecord, ProfileRecord, RelationFavor, RelationRecord } from './types'

// This interface uses by-name style JSON RPC.

/**
 * Methods starts with "SNSAdaptor_" can only be called in SNS Adaptor.
 * Other methods can only be called in the background page.
 */
export type ProfileIdentifier_string = string
export type PersonaIdentifier_string = string
export interface MaskNetworkAPIs {
    app_suspended(): Promise<void>
    app_resume(): Promise<void>
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
    // settings_getTrendingDataSource(): Promise<DataProvider>
    // settings_setTrendingDataSource(params: { provider: DataProvider }): Promise<void>
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
    persona_restoreFromPrivateKey(params: { privateKey: string; nickname: string }): Promise<Persona>
    persona_connectProfile(params: {
        profileIdentifier: ProfileIdentifier_string
        personaIdentifier: PersonaIdentifier_string
    }): Promise<void>
    persona_disconnectProfile(params: { identifier: ProfileIdentifier_string }): Promise<void>
    persona_backupMnemonic(params: { identifier: PersonaIdentifier_string }): Promise<string | undefined>
    persona_backupBase64(params: { identifier: PersonaIdentifier_string }): Promise<string>
    persona_backupJson(params: { identifier: PersonaIdentifier_string }): Promise<unknown>
    persona_backupPrivateKey(params: { identifier: PersonaIdentifier_string }): Promise<string | undefined>
    persona_queryPersonaByPrivateKey(params: { privateKey: string }): Promise<Persona | undefined>
    persona_getCurrentPersonaIdentifier(): Promise<string | undefined>
    persona_setCurrentPersonaIdentifier(params: { identifier: PersonaIdentifier_string }): Promise<void>
    persona_getOwnedPersonaInformation(params: { identifier: PersonaIdentifier_string }): Promise<PersonaInformation>
    persona_logout(params: { identifier: PersonaIdentifier_string }): Promise<void>
    profile_queryProfiles(params: { network: string }): Promise<Profile[]>
    profile_queryMyProfiles(params: { network: string }): Promise<Profile[]>
    profile_updateProfileInfo(params: {
        identifier: ProfileIdentifier_string
        data: { nickname?: string; avatarURL?: string }
    }): Promise<void>
    profile_removeProfile(params: { identifier: ProfileIdentifier_string }): Promise<void>
    profile_updateRelation(params: {
        profile: ProfileIdentifier_string
        linked: PersonaIdentifier_string
        favor: RelationFavor
    }): Promise<void>
    profile_queryRelationPaged(params: { network: string; after?: RelationRecord; count: number }): Promise<Profile[]>
    wallet_updateEthereumAccount(params: { account: string }): Promise<void>
    wallet_updateEthereumChainId(params: { chainId: number }): Promise<void>
    wallet_getLegacyWalletInfo(): Promise<WalletInfo[]>
    get_all_indexedDB_records(): Promise<{
        personas: PersonaRecord[]
        profiles: ProfileRecord[]
        relations: RelationRecord[]
    }>
}

export interface WalletInfo {
    address: string
    name?: string
    path?: string
    mnemonic: string[]
    passphrase: string
    private_key?: string
    /** Unix timestamp */
    createdAt: number
    /** Unix timestamp */
    updatedAt: number
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

export interface ProfileRelation {
    identifier: string
    nickname?: string
    linkedPersona: boolean
    /** Unix timestamp */
    createdAt: number
    /** Unix timestamp */
    updatedAt: number
    favor: RelationFavor
    personaIdentifier?: string
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

export interface PersonaInformation {
    nickname?: string
    identifier: string
    linkedProfiles: ProfileInformation[]
}

export interface ProfileInformation {
    nickname?: string
    avatar?: string
    identifier: string
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
    OPENOCEAN = 10,
    WANNASWAP = 11,
    TRISOLARIS = 12,
    TRADERJOE = 13,
    PANGOLIN = 14,
    MDEX = 15,
}

/** Supported language settings */
export enum LanguageOptions {
    __auto__ = 'auto',
    enUS = 'en-US',
    zhCN = 'zh-CN',
    zhTW = 'zh-TW',
    koKR = 'ko-KR',
    jaJP = 'ja-JP',
}

/** Supported display languages */
export enum SupportedLanguages {
    enUS = 'en-US',
    zhCN = 'zh-CN',
    zhTW = 'zh-TW',
    koKR = 'ko-KR',
    jaJP = 'ja-JP',
}

/**
 * Keep updating to packages/web3-shared/evm/types/index.ts
 */
export enum NetworkType {
    Ethereum = 'Ethereum',
    Binance = 'Binance',
    Polygon = 'Polygon',
    Arbitrum = 'Arbitrum',
    xDai = 'xDai',
    Celo = 'Celo',
    Fantom = 'Fantom',
    Aurora = 'Aurora',
    Avalanche = 'Avalanche',
    Boba = 'Boba',
    Fuse = 'Fuse',
    Metis = 'Metis',
    Optimistic = 'Optimistic',
    Conflux = 'Conflux',
}

export enum ProviderType {
    MaskWallet = 'Maskbook',
    MetaMask = 'MetaMask',
    WalletConnect = 'WalletConnect',
    Fortmatic = 'Fortmatic',
    Coin98 = 'Coin98',
    MathWallet = 'MathWallet',
    WalletLink = 'WalletLink',
    CustomNetwork = 'CustomNetwork',
}

export enum FungibleAssetProvider {
    ZERION = 'Zerion',
    DEBANK = 'Debank',
}

export enum NonFungibleAssetProvider {
    OPENSEA = 'OpenSea',
    RARIBLE = 'Rarible',
    NFTSCAN = 'NFTScan',
    ZORA = 'Zora',
}

export interface PriceRecord {
    [currency: string]: number
}

/** Base on response of coingecko's token price API */
export interface CryptoPrice {
    [token: string]: PriceRecord
}

export enum NetworkPluginID {
    PLUGIN_EVM = 'com.mask.evm',
    PLUGIN_FLOW = 'com.mask.flow',
    PLUGIN_SOLANA = 'com.mask.solana',
}
