import { createPluginMessage, createPluginRPC, PluginMessageEmitter } from '@masknet/plugin-infra'
import { PLUGIN_IDENTIFIER } from './constants'

export interface WalletMessage {
    /** wallet DB was updated */
    walletsUpdated: void

    /** true: Now locked; false: Now unlocked */
    walletLockStatusUpdated: boolean

    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()

export const WalletMessages: PluginMessageEmitter<WalletMessage> = createPluginMessage<WalletMessage>(PLUGIN_IDENTIFIER)

export const WalletRPC = createPluginRPC(PLUGIN_IDENTIFIER, () => import('./services'), WalletMessages.rpc)
