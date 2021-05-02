import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { DHEDGE_PLUGIN_ID } from './constants'

type DonationDialogUpdated =
    | {
          open: true
          title: string
          address: string
      }
    | {
          open: false
      }

interface DHedgeMessages {
    /**
     * Open donation dialog
     */
    donationDialogUpdated: DonationDialogUpdated

    rpc: unknown
}

export const PluginDHedgeMessages = createPluginMessage<DHedgeMessages>(DHEDGE_PLUGIN_ID)
export const PluginDHedgeRPC = createPluginRPC(
    DHEDGE_PLUGIN_ID,
    () => import('./services'),
    PluginDHedgeMessages.events.rpc,
)
