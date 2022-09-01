import { createPluginMessage, PluginId, PluginMessageEmitter } from '@masknet/plugin-infra'
import type { TipTask } from './types'

export interface TipMessage {
    tipTask: TipTask
    tipTaskUpdate: TipTask
    tipsSettingUpdate: void
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginNextIDMessages: PluginMessageEmitter<TipMessage> = createPluginMessage(PluginId.Tips)
