import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants'

type SwapDialogUpdated =
    | {
          open: true
          marketId: string
          txType: string
      }
    | {
          open: false
      }

type PoolDialogUpdated =
    | {
          open: true
          marketId: string
          txType: string
          inputAmount: number | string
      }
    | {
          open: false
      }

interface OmenMessages {
    /**
     * Open swap dialog
     */
    SwapDialogUpdated: SwapDialogUpdated

    /**
     * Open pool dialog
     */
    PoolDialogUpdated: PoolDialogUpdated

    rpc: unknown
}

export const PluginOmenMessages: PluginMessageEmitter<OmenMessages> = createPluginMessage(PLUGIN_ID)
export const PluginOmenRPC = createPluginRPC(PLUGIN_ID, () => import('./services'), PluginOmenMessages.rpc)
