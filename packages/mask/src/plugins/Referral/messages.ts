import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { META_KEY } from './constants'

export type SelectTokenUpdated =
    | {
          open: true
          uuid: string
          title: string
          onlyFarmTokens?: boolean
      }
    | {
          open: false
          uuid: string
          token?: FungibleTokenDetailed
      }

interface ReferralMessages {
    /**
     * Open select token dialog
     */
    selectTokenUpdated: SelectTokenUpdated

    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginReferralMessages: PluginMessageEmitter<ReferralMessages> = createPluginMessage(META_KEY)
