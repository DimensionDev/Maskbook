import { PluginID } from '@masknet/web3-shared-base'
import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import type { TipTask } from './types/index.js'

export interface TipMessage {
    tipTask: TipTask
    tipTaskUpdate: TipTask
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginTipsMessages: PluginMessageEmitter<TipMessage> = createPluginMessage(PluginID.Tips)
