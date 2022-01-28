import { createPluginMessage, createPluginRPC, PluginMessageEmitter } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants'

export interface MaskBoxMessages {
    rpc: unknown
}

export const MaskBoxMessages: PluginMessageEmitter<MaskBoxMessages> = createPluginMessage(PLUGIN_ID)
export const MaskBoxRPC = createPluginRPC(PLUGIN_ID, () => import('./services'), MaskBoxMessages.rpc)
