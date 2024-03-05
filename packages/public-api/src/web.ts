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
