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

if (module.hot) module.hot.accept()
export const PluginTransakMessages = createPluginMessage<PluginTransakMessage>(PLUGIN_IDENTIFIER)
