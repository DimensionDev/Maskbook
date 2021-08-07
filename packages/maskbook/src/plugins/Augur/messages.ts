import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import type { FungibleTokenDetailed } from '@masknet/web3-shared'
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

type SellDialogUpdated =
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
    BuyDialogUpdated: BuyDialogUpdated
    SellDialogUpdated: SellDialogUpdated
    rpc: unknown
}

export const PluginAugurMessages: PluginMessageEmitter<AugurMessages> =
    createPluginMessage<AugurMessages>(AUGUR_PLUGIN_ID)

export const PluginAugurRPC = createPluginRPC(AUGUR_PLUGIN_ID, () => import('./services'), PluginAugurMessages.rpc)
