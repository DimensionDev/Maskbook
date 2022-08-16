import { createGlobalSettings } from '../../../shared/legacy-settings/createSettings'
import { PetsPluginID } from './constants'

export const petShowSettings = createGlobalSettings(`${PetsPluginID}+selectedClosePet`, true)
