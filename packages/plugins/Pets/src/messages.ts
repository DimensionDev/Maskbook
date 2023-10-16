import { createPluginMessage, type PluginMessageEmitter } from '@masknet/plugin-infra'
import { serializer } from '@masknet/shared-base'
import { PetsPluginID } from './constants.js'
import type { PetsDialogEvent } from './types.js'
interface PetMessage {
    /**
     * Pets essay set dialog
     */
    essayDialogUpdated: PetsDialogEvent
    setResult: number
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginPetMessages: {
    events: PluginMessageEmitter<PetMessage>
} = {
    events: createPluginMessage<PetMessage>(PetsPluginID, serializer),
}
