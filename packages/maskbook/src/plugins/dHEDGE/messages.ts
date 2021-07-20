import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import { createPluginRPC } from '../utils/createPluginRPC'
import { DHEDGE_PLUGIN_ID } from './constants'
import type { Pool } from './types'

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
export const PluginDHedgeRPC = createPluginRPC(DHEDGE_PLUGIN_ID, () => import('./services'), PluginDHedgeMessages.rpc)
