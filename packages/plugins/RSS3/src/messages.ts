import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'

interface ProfileMessages {
    rpc: unknown
}

export const PluginRSS3Messages: PluginMessageEmitter<ProfileMessages> = createPluginMessage(PLUGIN_ID)
export const PluginRSS3RPC = createPluginRPC(PLUGIN_ID, () => import('./services.js'), PluginRSS3Messages.rpc)
