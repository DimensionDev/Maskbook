import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { FOUNDATION_PLUGIN_ID } from './constants'

interface FoundationMessages {
    rpc: unknown
}

export const PluginFoundationMessage: PluginMessageEmitter<FoundationMessages> =
    createPluginMessage(FOUNDATION_PLUGIN_ID)
export const PluginFoundationRPC = createPluginRPC(
    FOUNDATION_PLUGIN_ID,
    () => import('./services'),
    PluginFoundationMessage.rpc,
)
