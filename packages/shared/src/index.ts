export * from './contexts/index.js'
export * from './hooks/index.js'
export * from './wallet/index.js'
export * from './UI/index.js'
export * from './locales/index.js'
export * from './locales/languages.js'
export * from './constants.js'
export * from './storage/index.js'
export * from './types.js'
// This interface is used as a proxy type to avoid circular project dependencies
export interface DashboardPluginMessages {
    Wallet: unknown
    Transak: unknown
    Swap: unknown
}

export interface DashboardPluginServices {
    Wallet: unknown
}
