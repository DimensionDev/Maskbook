export * from './contexts'
export * from './hooks'
export * from './wallet'
export * from './UI'
export * from './locales'
export * from './locales/languages'
export * from './constants'
export * from './storage'
export * from './types'
// This interface is used as a proxy type to avoid circular project dependencies
export interface DashboardPluginMessages {
    Wallet: unknown
    Transak: unknown
    Swap: unknown
}

export interface DashboardPluginServices {
    Wallet: unknown
}
