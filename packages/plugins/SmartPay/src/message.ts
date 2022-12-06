import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'

type SmartPayDescriptionDialogEvent = { open: boolean }
type SmartPayDialogEvent = { open: boolean }
type ApproveDialogEvent = { open: boolean }
export interface PluginSmartPayMessage {
    smartPayDescriptionDialogEvent: SmartPayDescriptionDialogEvent
    smartPayDialogEvent: SmartPayDialogEvent
    approveDialogEvent: ApproveDialogEvent
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginSmartPayMessages: PluginMessageEmitter<PluginSmartPayMessage> = createPluginMessage(PLUGIN_ID)
