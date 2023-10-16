import { createPluginMessage, type PluginMessageEmitter } from '@masknet/plugin-infra'
import type { PersonaInformation, Wallet } from '@masknet/shared-base'
import { PLUGIN_ID } from './constants.js'

type SmartPayDescriptionDialogEvent = { open: boolean }
type SmartPayDialogEvent = {
    open: boolean
    hasAccounts?: boolean
    signPersona?: PersonaInformation
    signWallet?: Wallet
}
type ReceiveDialogEvent = { open: boolean; address?: string; name?: string }

interface PluginSmartPayMessage {
    smartPayDescriptionDialogEvent: SmartPayDescriptionDialogEvent
    smartPayDialogEvent: SmartPayDialogEvent
    receiveDialogEvent: ReceiveDialogEvent
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginSmartPayMessages: PluginMessageEmitter<PluginSmartPayMessage> = createPluginMessage(PLUGIN_ID)
