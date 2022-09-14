import { createGlobalSettings } from '../../../shared/legacy-settings/createSettings.js'
import { PetsPluginID } from './constants.js'

export const petShowSettings = createGlobalSettings(`${PetsPluginID}+selectedClosePet`, true)
