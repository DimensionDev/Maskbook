import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants'

type VaultListDialogEvent =
    | {
          open: true
          code?: string
          address: string
      }
    | {
          open: false
      }

interface PluginYearnFinanceMessage {
    vaultListDialogUpdated: VaultListDialogEvent
    rpc: unknown
    withdrawTokenDialog: VaultListDialogEvent
    depositTokenDialog: VaultListDialogEvent
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginYearnFinanceMessages: PluginMessageEmitter<PluginYearnFinanceMessage> = createPluginMessage(PLUGIN_ID)
