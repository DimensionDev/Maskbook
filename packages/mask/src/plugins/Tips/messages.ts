import { createPluginMessage, PluginId, PluginMessageEmitter } from '@masknet/plugin-infra'
import type { TipTask } from './types'

export interface TipMessage {
    tipTask: TipTask

    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginNextIDMessages: PluginMessageEmitter<TipMessage> = createPluginMessage(PluginId.Tips)
