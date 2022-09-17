import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'

type DialogUpdated = {
    open: boolean
}

interface DebuggerMessages {
    /**
     * Open console dialog
     */
    consoleDialogUpdated: DialogUpdated

    /**
     * Open connection dialog
     */
    connectionDialogUpdated: DialogUpdated

    /**
     * Open hub dialog
     */
    hubDialogUpdated: DialogUpdated

    /**
     * Open widget dialog
     */
    widgetDialogUpdated: DialogUpdated

    rpc: unknown
}

export const PluginDebuggerMessages: PluginMessageEmitter<DebuggerMessages> = createPluginMessage(PLUGIN_ID)
export const PluginDebuggerRPC = createPluginRPC(
    PLUGIN_ID,
    () => import('./services/index.js'),
    PluginDebuggerMessages.rpc,
)
