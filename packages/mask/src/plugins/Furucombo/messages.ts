import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'

interface FurucomboMessages {
    rpc: unknown
}
export const PluginFurucomboMessages: PluginMessageEmitter<FurucomboMessages> = createPluginMessage(PLUGIN_ID)
export const PluginFurucomboRPC = createPluginRPC(PLUGIN_ID, () => import('./services.js'), PluginFurucomboMessages.rpc)
