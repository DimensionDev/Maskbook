import { createPluginMessage, createPluginRPC, PluginMessageEmitter } from '@masknet/plugin-infra'
import { PLUGIN_IDENTIFIER } from './constants'

export interface MaskBoxMessages {
    rpc: unknown
}

export const MaskBoxMessages: PluginMessageEmitter<MaskBoxMessages> = createPluginMessage(PLUGIN_IDENTIFIER)
export const MaskBoxRPC = createPluginRPC(PLUGIN_IDENTIFIER, () => import('./services'), MaskBoxMessages.rpc)
