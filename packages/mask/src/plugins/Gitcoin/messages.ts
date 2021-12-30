import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants'

type DonationDialogUpdated =
    | {
          open: true
          title: string
          address: string
          postLink: string | URL
      }
    | {
          open: false
      }

interface GitcoinMessages {
    /**
     * Open donation dialog
     */
    donationDialogUpdated: DonationDialogUpdated

    rpc: unknown
}

export const PluginGitcoinMessages: PluginMessageEmitter<GitcoinMessages> = createPluginMessage(PLUGIN_ID)
export const PluginGitcoinRPC = createPluginRPC(PLUGIN_ID, () => import('./services'), PluginGitcoinMessages.rpc)
