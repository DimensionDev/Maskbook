import { createPluginMessage, PluginID, PluginMessageEmitter } from '@masknet/plugin-infra'
import type { Task } from './types/index.js'

export interface TipMessage {
    tipsTask: Task
    tipsTaskUpdate: Task
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginTipsMessages: PluginMessageEmitter<TipMessage> = createPluginMessage(PluginID.Tips)
