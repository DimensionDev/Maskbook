import { createGlobalSettings } from '@masknet/shared-base'
import { PetsPluginID } from './constants.js'

export const petShowSettings = createGlobalSettings(`${PetsPluginID}+selectedClosePet`, true)
