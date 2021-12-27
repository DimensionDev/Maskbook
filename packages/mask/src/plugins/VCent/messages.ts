import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_IDENTIFIER } from './constants'

interface VCentMessages {
    rpc: unknown
}

export const PluginVCentMessages: PluginMessageEmitter<VCentMessages> = createPluginMessage(PLUGIN_IDENTIFIER)
export const PluginVCentRPC = createPluginRPC(PLUGIN_IDENTIFIER, () => import('./services'), PluginVCentMessages.rpc)
