import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants'

type CheckSecurityDialogEvent = { open: boolean }

interface PluginGoPlusSecurityMessage {
    checkSecurityDialogEvent: CheckSecurityDialogEvent
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginGoPlusSecurityMessages: PluginMessageEmitter<PluginGoPlusSecurityMessage> =
    createPluginMessage(PLUGIN_ID)
