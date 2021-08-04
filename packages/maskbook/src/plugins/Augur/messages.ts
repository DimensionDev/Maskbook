import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { FungibleTokenDetailed } from '@masknet/web3-shared'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { AUGUR_PLUGIN_ID } from './constants'
import type { AMMOutcome, Market } from './types'

type BuyDialogUpdated =
    | {
          open: true
          market: Market
          outcome: AMMOutcome
          cashToken: FungibleTokenDetailed
      }
    | {
          open: false
      }

interface AugurMessages {
    ConfirmDialogUpdated: BuyDialogUpdated
    rpc: unknown
}

export const PluginAugurMessages: WebExtensionMessage<AugurMessages> =
    createPluginMessage<AugurMessages>(AUGUR_PLUGIN_ID)

export const PluginAugurRPC = createPluginRPC(
    AUGUR_PLUGIN_ID,
    () => import('./services'),
    PluginAugurMessages.events.rpc,
)
