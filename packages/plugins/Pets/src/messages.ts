import { getPluginMessage, type PluginMessageEmitter } from '@masknet/plugin-infra'
import { PetsPluginID } from './constants.js'
import type { PetsDialogEvent } from './types.js'
interface PetMessage {
    /**
     * Pets essay set dialog
     */
    essayDialogUpdated: PetsDialogEvent
    setResult: number
}

import.meta.webpackHot?.accept()
export const PluginPetMessages: PluginMessageEmitter<PetMessage> = getPluginMessage<PetMessage>(PetsPluginID)
