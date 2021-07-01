import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { createPluginMessage } from '../utils/createPluginMessage'
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

interface PluginTransakMessage {
    buyTokenDialogUpdated: BuyTokenDialogEvent
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginTransakMessages: WebExtensionMessage<PluginTransakMessage> =
    createPluginMessage<PluginTransakMessage>(PLUGIN_IDENTIFIER)
