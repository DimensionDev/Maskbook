import { createGlobalSettings } from '../../settings/createSettings'
import { PetsPluginID } from './constants'

export const petShowSettings = createGlobalSettings(`${PetsPluginID}+selectedClosePet`, true)
