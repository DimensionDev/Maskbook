import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { ENTROPYFI_PLUGIN_ID } from './constants'
import.meta.webpackHot && import.meta.webpackHot.accept()

type DialogUpdated =
    | {
          open: true
          tile: string
          address: string
      }
    | {
          open: false
      }

interface EntropyfiMessages {
    /**
     * Open donation dialog
     */
    donationDialogUpdated: DialogUpdated

    rpc: unknown
}
export const PluginEntropyfiMessages: PluginMessageEmitter<EntropyfiMessages> = createPluginMessage(ENTROPYFI_PLUGIN_ID)

export const PluginEntropyfiRPC = createPluginRPC(
    ENTROPYFI_PLUGIN_ID,
    () => import('./services'),
    PluginEntropyfiMessages.rpc,
)
