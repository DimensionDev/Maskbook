import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { POOLTOGETHER_PLUGIN_ID } from './constants'
import type { Pool } from './types'

type DepositDialogUpdated =
    | {
          open: true
          pool: Pool
          token: FungibleToken<ChainId, SchemaType>
      }
    | {
          open: false
      }

interface PoolTogetherMessages {
    DepositDialogUpdated: DepositDialogUpdated

    rpc: unknown
}
import.meta.webpackHot && import.meta.webpackHot.accept()
export const PluginPoolTogetherMessages: PluginMessageEmitter<PoolTogetherMessages> =
    createPluginMessage(POOLTOGETHER_PLUGIN_ID)

export const PluginPooltogetherRPC = createPluginRPC(
    POOLTOGETHER_PLUGIN_ID,
    () => import('./services'),
    PluginPoolTogetherMessages.rpc,
)
