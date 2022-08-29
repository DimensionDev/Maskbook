import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants'

type PersonaSelectPanelDialogEvent = {
    open: boolean
    target?: string
    position?: 'center' | 'top-right'
    enableVerify: boolean
}

interface PluginNextIDMessage {
    /**
     * Application Persona List dialog
     */
    PersonaSelectPanelDialogUpdated: PersonaSelectPanelDialogEvent
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginNextIDMessages: PluginMessageEmitter<PluginNextIDMessage> = createPluginMessage(PLUGIN_ID)
