import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
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

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginITO_Messages: WebExtensionMessage<ITO_Message> = createPluginMessage<ITO_Message>(ITO_PluginID)
export const PluginITO_RPC = createPluginRPC(
    ITO_PluginID,
    () => import('./Worker/services'),
    PluginITO_Messages.events.rpc,
)
