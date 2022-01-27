import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { serializer } from '@masknet/shared-base'
import { PetsPluginID } from './constants'
import type { PetsDialogEvent } from './types'
export interface PetMessage {
    /**
     * Pets essay set dialog
     */
    essayDialogUpdated: PetsDialogEvent
    setResult: number
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginPetMessages: { events: PluginMessageEmitter<PetMessage> } = {
    events: createPluginMessage<PetMessage>(PetsPluginID, serializer),
}

export const PluginPetRPC = createPluginRPC(PetsPluginID, () => import('./Services'), PluginPetMessages.events.rpc)
