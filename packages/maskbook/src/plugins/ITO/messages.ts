import { ITO_PluginID } from './constants'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import type { JSON_PayloadInMask } from './types'

type SwapTokenDialogEvent =
    | {
          open: true
          payload: JSON_PayloadInMask
      }
    | {
          open: false
      }

interface ITO_Message {
    swapTokenUpdated: SwapTokenDialogEvent

    poolUpdated: void

    rpc: unknown
}

if (module.hot) module.hot.accept()
export const PluginITO_Messages = createPluginMessage<ITO_Message>(ITO_PluginID)
export const PluginITO_RPC = createPluginRPC(ITO_PluginID, () => import('./services'), PluginITO_Messages.events.rpc)
