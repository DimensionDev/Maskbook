export * from './hooks'
export * from './wallet'
export * from './UI'
export * from './locales'
export * from './utils'
export * from './constants'
export * from '@masknet/shared-base'
// This interface is used as a proxy type to avoid circular project dependencies
export interface DashboardPluginMessages {
    Wallet: unknown
    Transak: unknown
    Swap: unknown
    Pets: unknown
}

export interface DashboardPluginServices {
    Wallet: unknown
    Swap: unknown
    Pets: unknown
}
