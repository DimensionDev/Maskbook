import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants'

type PersonaListDialogEvent = { open: boolean; target?: string }

interface PluginNextIDMessage {
    /**
     * Application Persona List dialog
     */
    PersonaListDialogUpdated: PersonaListDialogEvent
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginNextIDMessages: PluginMessageEmitter<PluginNextIDMessage> = createPluginMessage(PLUGIN_ID)
