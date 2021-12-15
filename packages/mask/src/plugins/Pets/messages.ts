import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { PetsPluginID } from './constants'
import type { PetsDialogEvent } from './types'

export interface PetMessage {
    /**
     * Pets essay set dialog
     */
    essayDialogUpdated: PetsDialogEvent

    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginPetMessages: PluginMessageEmitter<PetMessage> = createPluginMessage(PetsPluginID)
export const PluginPetRPC = createPluginRPC(PetsPluginID, () => import('./Services'), PluginPetMessages.rpc)
