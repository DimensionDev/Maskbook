import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import { foundation_ID } from './constants'

type FoundationDialogUpdated =
    | {
          open: true
          title: string
          auctionId: string
      }
    | {
          open: false
      }

interface FoundationMessages {
    /**
     * Open donation dialog
     */
    foundationDialogUpdated: FoundationDialogUpdated

    rpc: unknown
}

export const PluginFoundationMessages: PluginMessageEmitter<FoundationMessages> = createPluginMessage(foundation_ID)
// export const PluginGitcoinRPC = createPluginRPC(
//     foundation_ID,
//     () => import('./services'),
//     PluginGitcoinMessages.rpc,
// )
