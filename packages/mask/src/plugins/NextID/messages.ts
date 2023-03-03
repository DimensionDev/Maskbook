import { createPluginMessage, type PluginMessageEmitter } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'

interface PluginNextIDMessage {
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginNextIDMessages: PluginMessageEmitter<PluginNextIDMessage> = createPluginMessage(PLUGIN_ID)
