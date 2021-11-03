import { createPluginMessage, createPluginRPC, PluginMessageEmitter } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants'

interface FurucomboMessages {
    rpc: unknown
}
export const PluginFurucomboMessages: PluginMessageEmitter<FurucomboMessages> = createPluginMessage(PLUGIN_ID)
export const PluginFurucomboRPC = createPluginRPC(PLUGIN_ID, () => import('./services'), PluginFurucomboMessages.rpc)
