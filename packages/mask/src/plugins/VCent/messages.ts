import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants'

interface VCentMessages {
    rpc: unknown
}

export const PluginVCentMessages: PluginMessageEmitter<VCentMessages> = createPluginMessage(PLUGIN_ID)
export const PluginVCentRPC = createPluginRPC(PLUGIN_ID, () => import('./services'), PluginVCentMessages.rpc)
