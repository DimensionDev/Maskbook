import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import type { Pool } from './types'

type SocialTokenDialogUpdated =
    | {
          open: true
          pool: Pool
          tokens: string[]
      }
    | {
          open: false
      }

interface ShoyuMessages {
    /**
     * Open Social Token dialog
     */

    SocialTokenDialogUpdated: SocialTokenDialogUpdated

    rpc: unknown
}

export const PluginShoyuMessages: PluginMessageEmitter<ShoyuMessages> = createPluginMessage(SHOYU_PLUGIN_ID)
export const PluginShoyuRPC = createPluginRPC(SHOYU_PLUGIN_ID, () => import('./services'), PluginShoyuMessages.rpc)
