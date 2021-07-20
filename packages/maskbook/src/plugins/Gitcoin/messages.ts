import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { GITCOIN_PLUGIN_ID } from './constants'

type DonationDialogUpdated =
    | {
          open: true
          title: string
          address: string
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

export const PluginGitcoinMessages: PluginMessageEmitter<GitcoinMessages> = createPluginMessage(GITCOIN_PLUGIN_ID)
export const PluginGitcoinRPC = createPluginRPC(
    GITCOIN_PLUGIN_ID,
    () => import('./services'),
    PluginGitcoinMessages.rpc,
)
