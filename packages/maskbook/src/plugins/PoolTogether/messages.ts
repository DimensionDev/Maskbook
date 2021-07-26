import type { ERC20TokenDetailed } from '@masknet/web3-shared'
import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import { createPluginRPC } from '../utils/createPluginRPC'
import { POOLTOGETHER_PLUGIN_ID } from './constants'
import type { Pool } from './types'

type DepositDialogUpdated =
    | {
          open: true
          pool: Pool
          token: ERC20TokenDetailed
      }
    | {
          open: false
      }

interface PoolTogetherMessages {
    DepositDialogUpdated: DepositDialogUpdated

    rpc: unknown
}
import.meta.webpackHot?.accept()
export const PluginPoolTogetherMessages: PluginMessageEmitter<PoolTogetherMessages> =
    createPluginMessage(POOLTOGETHER_PLUGIN_ID)

export const PluginPooltogetherRPC = createPluginRPC(
    POOLTOGETHER_PLUGIN_ID,
    () => import('./services'),
    PluginPoolTogetherMessages.rpc,
)
