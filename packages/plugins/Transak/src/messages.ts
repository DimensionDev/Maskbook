import { createPluginMessage, type PluginMessageEmitter } from '@masknet/plugin-infra'
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

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginTransakMessages: PluginMessageEmitter<PluginTransakMessage> = createPluginMessage(PLUGIN_ID)
