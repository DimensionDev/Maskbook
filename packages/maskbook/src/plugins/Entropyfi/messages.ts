import type { ERC20TokenDetailed } from '@masknet/web3-shared'
import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { ENTROPYFI_PLUGIN_ID } from './constants'

type DepositDialogUpdated =
    | {
          open: true
          poolId: string
          choose: string
          token: ERC20TokenDetailed | undefined
          chainId: number
      }
    | {
          open: false
      }

interface EntropyfiMessages {
    DepositDialogUpdated: DepositDialogUpdated

    rpc: unknown
}
import.meta.webpackHot && import.meta.webpackHot.accept()
export const PluginEntropyfiMessages: PluginMessageEmitter<EntropyfiMessages> = createPluginMessage(ENTROPYFI_PLUGIN_ID)

export const PluginEntropyfiRPC = createPluginRPC(
    ENTROPYFI_PLUGIN_ID,
    () => import('./services'),
    PluginEntropyfiMessages.rpc,
)
