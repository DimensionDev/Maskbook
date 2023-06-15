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

export interface ProfileState {
    [key: string]: 'pending' | 'confirmed'
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
    ARTHSWAP = 19,
    VERSA = 20,
    ASTAREXCHANGE = 21,
    YUMISWAP = 22,
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

export enum BooleanPreference {
    False = 0,
    Default = 1,
    True = 2,
}
