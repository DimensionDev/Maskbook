import { PluginID } from '@masknet/shared-base'
import { createPluginMessage, type PluginMessageEmitter } from '@masknet/plugin-infra'
import type { TipTask } from './types/index.js'

export interface TipMessage {
    tipTask: TipTask
    tipTaskUpdate: TipTask
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginTipsMessages: PluginMessageEmitter<TipMessage> = createPluginMessage(PluginID.Tips)
