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
}

export const PluginTransakMessages = createPluginMessage<PluginTransakMessage>(PLUGIN_IDENTIFIER)
