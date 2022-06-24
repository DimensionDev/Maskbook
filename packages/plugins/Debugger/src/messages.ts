import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants'

type ConsoleDialogUpdated =
    | {
          open: boolean
      }

interface DebuggerMessages {
    /**
     * Open console dialog
     */
    consoleDialogUpdated: ConsoleDialogUpdated

    rpc: unknown
}

export const PluginDebuggerMessages: PluginMessageEmitter<DebuggerMessages> = createPluginMessage(PLUGIN_ID)
export const PluginDebuggerRPC = createPluginRPC(PLUGIN_ID, () => import('./services'), PluginDebuggerMessages.rpc)
