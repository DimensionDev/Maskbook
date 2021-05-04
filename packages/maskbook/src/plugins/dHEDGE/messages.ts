import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { DHEDGE_PLUGIN_ID } from './constants'

type InvestDialogUpdated =
    | {
          open: true
          name: string
          address: string
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

export const PluginDHedgeMessages = createPluginMessage<DHedgeMessages>(DHEDGE_PLUGIN_ID)
export const PluginDHedgeRPC = createPluginRPC(
    DHEDGE_PLUGIN_ID,
    () => import('./services'),
    PluginDHedgeMessages.events.rpc,
)
