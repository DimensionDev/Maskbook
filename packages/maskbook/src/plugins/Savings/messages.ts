import { createPluginMessage, createPluginRPC, PluginMessageEmitter } from '@masknet/plugin-infra'
import { PLUGIN_IDENTIFIER } from './constants'

export interface MaskBoxMessages {
    rpc: unknown
}

export const SavingsMessages: PluginMessageEmitter<MaskBoxMessages> = createPluginMessage(PLUGIN_IDENTIFIER)
export const SavingsRPC = createPluginRPC(PLUGIN_IDENTIFIER, () => import('./services'), SavingsMessages.rpc)
