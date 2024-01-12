import { getPluginMessage, type PluginMessageEmitter } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'

type DialogUpdated = {
    open: boolean
}

export interface DebuggerMessages {
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
}

export const PluginDebuggerMessages: PluginMessageEmitter<DebuggerMessages> = getPluginMessage(PLUGIN_ID)
