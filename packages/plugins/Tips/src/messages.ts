import { PluginID } from '@masknet/shared-base'
import { getPluginMessage, type PluginMessageEmitter } from '@masknet/plugin-infra'
import type { TipTask } from './types/index.js'

interface TipMessage {
    tipTask: TipTask
    tipTaskUpdate: TipTask
}

import.meta.webpackHot?.accept()
export const PluginTipsMessages: PluginMessageEmitter<TipMessage> = getPluginMessage(PluginID.Tips)
