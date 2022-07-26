import type { PersonaRecord, ProfileRecord, RelationFavor, RelationRecord } from './types/index.js'

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
    settings_getBackupPreviewInfo(params: { backupInfo: string }): Promise<BackupPreview>
    settings_restoreBackup(params: { backupInfo: string }): Promise<void>
    persona_createPersonaByMnemonic(params: {
        mnemonic: string
        nickname: string
        password: string
    }): Promise<MobilePersona>
    persona_queryPersonas(params: {
        identifier?: PersonaIdentifier_string
        hasPrivateKey: boolean
    }): Promise<MobilePersona[]>
    persona_queryMyPersonas(params: { network?: string }): Promise<MobilePersona[]>
    persona_updatePersonaInfo(params: {
        identifier: PersonaIdentifier_string
        data: { nickname: string }
    }): Promise<void>
    persona_removePersona(params: { identifier: PersonaIdentifier_string }): Promise<void>
    /** @deprecated It's an alias of settings_restoreBackup */
    persona_restoreFromJson(params: { backup: string }): Promise<void>
    persona_restoreFromPrivateKey(params: { privateKey: string; nickname: string }): Promise<MobilePersona>
    persona_connectProfile(params: {
        profileIdentifier: ProfileIdentifier_string
        personaIdentifier: PersonaIdentifier_string
    }): Promise<void>
    persona_disconnectProfile(params: { identifier: ProfileIdentifier_string }): Promise<void>
    persona_backupPrivateKey(params: { identifier: PersonaIdentifier_string }): Promise<string | undefined>
    persona_queryPersonaByPrivateKey(params: { privateKey: string }): Promise<MobilePersona | undefined>
    persona_getCurrentPersonaIdentifier(): Promise<string | undefined>
    persona_setCurrentPersonaIdentifier(params: { identifier: PersonaIdentifier_string }): Promise<void>
    persona_logout(params: { identifier: PersonaIdentifier_string }): Promise<void>
    profile_queryProfiles(params: { network: string }): Promise<MobileProfile[]>
    profile_queryMyProfiles(params: { network: string }): Promise<MobileProfile[]>
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
    profile_queryRelationPaged(params: {
        network: string
        after?: RelationRecord
        count: number
    }): Promise<MobileProfileRelation[]>
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

export interface MobileProfile {
    identifier: string
    nickname?: string
    linkedPersona: boolean
    /** Unix timestamp */
    createdAt: number
    /** Unix timestamp */
    updatedAt: number
}

export interface MobileProfileRelation {
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

export interface MobilePersona {
    identifier: string
    nickname?: string
    linkedProfiles: ProfileState
    hasPrivateKey: boolean
    /** Unix timestamp */
    createdAt: number
    /** Unix timestamp */
    updatedAt: number
}

export interface MobilePersonaInformation {
    nickname?: string
    identifier: string
    linkedProfiles: MobileProfileInformation[]
}

export interface MobileProfileInformation {
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
    relations: number
    files: number
    wallets: number
    createdAt: number
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
    NFTSCAN = 3,
}

export enum TradeProvider {
    UNISWAP_V2 = 0,
    ZRX = 1,
    SUSHISWAP = 2,
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
    VENOMSWAP = 16,
    OPENSWAP = 17,
    DEFIKINGDOMS = 18,
    JUGGLERRED = 19,
    ELKFINANCE = 20,
    ZIPSWAP = 21,
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

export interface PriceRecord {
    [currency: string]: number
}

/** Base on response of coingecko's token price API */
export interface CryptoPrice {
    [token: string]: PriceRecord
}
