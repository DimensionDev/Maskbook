import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants'

interface ProfileMessages {
    rpc: unknown
}

export const PluginProfileMessages: PluginMessageEmitter<ProfileMessages> = createPluginMessage(PLUGIN_ID)
export const PluginProfileRPC = createPluginRPC(PLUGIN_ID, () => import('./services'), PluginProfileMessages.rpc)
