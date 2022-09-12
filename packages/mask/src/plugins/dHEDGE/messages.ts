import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { DHEDGE_PLUGIN_ID } from './constants.js'
import type { Pool } from './types.js'

type InvestDialogUpdated =
    | {
          open: true
          pool: Pool
          tokens: string[]
      }
    | {
          open: false
      }

interface DHedgeMessages {
    /**
     * Open invest dialog
     */
    InvestDialogUpdated: InvestDialogUpdated

    rpc: unknown
}

export const PluginDHedgeMessages: PluginMessageEmitter<DHedgeMessages> = createPluginMessage(DHEDGE_PLUGIN_ID)
export const PluginDHedgeRPC = createPluginRPC(
    DHEDGE_PLUGIN_ID,
    () => import('./services.js'),
    PluginDHedgeMessages.rpc,
)
