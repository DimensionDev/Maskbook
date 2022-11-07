import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import type { FungibleTokenDetailed } from './types.js'
import type { AsyncVersionOf } from 'async-call-rpc/full'

import { META_KEY, PLUGIN_ID } from './constants.js'

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
export const ReferralRPC: AsyncVersionOf<typeof import('./Worker/services.js')> = createPluginRPC(
    PLUGIN_ID,
    () => import('./Worker/services.js') as any,
    PluginReferralMessages.rpc,
)
