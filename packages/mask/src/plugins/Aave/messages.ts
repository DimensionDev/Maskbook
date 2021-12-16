import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import { PLUGIN_IDENTIFIER } from './constants'

type BuyTokenDialogEvent =
    | {
          open: true
          code?: string
          address: string
      }
    | {
          open: false
      }

interface PluginAaveMessage {
    buyTokenDialogUpdated: BuyTokenDialogEvent
    rpc: unknown
    withdrawTokenDialog: BuyTokenDialogEvent
    depositTokenDialog: BuyTokenDialogEvent
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginAaveMessages: PluginMessageEmitter<PluginAaveMessage> = createPluginMessage(PLUGIN_IDENTIFIER)
