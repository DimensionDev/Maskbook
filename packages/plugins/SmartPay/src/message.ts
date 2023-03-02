import { createPluginMessage, type PluginMessageEmitter } from '@masknet/plugin-infra'
import type { PersonaInformation } from '@masknet/shared-base'
import type { Wallet } from '@masknet/web3-shared-base'
import { PLUGIN_ID } from './constants.js'

type SmartPayDescriptionDialogEvent = { open: boolean }
type SmartPayDialogEvent = {
    open: boolean
    hasAccounts?: boolean
    signPersona?: PersonaInformation
    signWallet?: Wallet
}
type ReceiveDialogEvent = { open: boolean; address?: string; name?: string }

export interface PluginSmartPayMessage {
    smartPayDescriptionDialogEvent: SmartPayDescriptionDialogEvent
    smartPayDialogEvent: SmartPayDialogEvent
    receiveDialogEvent: ReceiveDialogEvent
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginSmartPayMessages: PluginMessageEmitter<PluginSmartPayMessage> = createPluginMessage(PLUGIN_ID)
