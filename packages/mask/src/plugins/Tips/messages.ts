import { createPluginMessage, PluginID, PluginMessageEmitter } from '@masknet/plugin-infra'
import type { TipTask } from './types/index.js'

export interface TipMessage {
    tipTask: TipTask
    tipTaskUpdate: TipTask
    tipsSettingUpdate: void
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginTipsMessages: PluginMessageEmitter<TipMessage> = createPluginMessage(PluginID.Tips)
