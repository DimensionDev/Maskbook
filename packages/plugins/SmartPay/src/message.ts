import { getPluginMessage, type PluginMessageEmitter } from '@masknet/plugin-infra'
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

import.meta.webpackHot?.accept()
export const PluginSmartPayMessages: PluginMessageEmitter<PluginSmartPayMessage> = getPluginMessage(PLUGIN_ID)
