import { getPluginMessage, type PluginMessageEmitter } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'

type BuyTokenDialogEvent =
    | {
          open: true
          code?: string
          address: string
      }
    | {
          open: false
      }

interface PluginTransakMessage {
    buyTokenDialogUpdated: BuyTokenDialogEvent
}

import.meta.webpackHot?.accept()
export const PluginTransakMessages: PluginMessageEmitter<PluginTransakMessage> = getPluginMessage(PLUGIN_ID)
