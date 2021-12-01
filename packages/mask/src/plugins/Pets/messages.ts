import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { PetsPluginID } from './constants'

interface CashTagEvent {
    name: string
    element: HTMLAnchorElement | null
}

interface PetsDialogEvent {
    open: boolean
}

interface PetsConfirmationEvent {
    open: boolean
}

export interface PetMessage {
    /**
     * View a cash tag
     */
    cashTagObserved: CashTagEvent

    /**
     * Confirm swap dialog
     */
    essayConfirmationUpdated: PetsConfirmationEvent

    /**
     * Pets essay set dialog
     */
    essayDialogUpdated: PetsDialogEvent

    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginPetMessages: PluginMessageEmitter<PetMessage> = createPluginMessage(PetsPluginID)
export const PluginPetRPC = createPluginRPC(PetsPluginID, () => import('./Services'), PluginPetMessages.rpc)
