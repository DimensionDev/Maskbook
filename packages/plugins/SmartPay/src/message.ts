import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'

type SmartPayDialogEvent = { open: true; inWhiteList: boolean } | { open: false }
type SmartPayDescriptionDialogEvent = { open: boolean }
export interface PluginSmartPayMessage {
    smartPayDialogEvent: SmartPayDialogEvent
    smartPayDescriptionDialogEvent: SmartPayDescriptionDialogEvent
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginSmartPayMessages: PluginMessageEmitter<PluginSmartPayMessage> = createPluginMessage(PLUGIN_ID)
