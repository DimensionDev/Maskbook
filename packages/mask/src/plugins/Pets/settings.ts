import { createGlobalSettings } from '../../settings/createSettings'
import { PetsPluginID } from './constants'

export const petShowSettings = createGlobalSettings<boolean>(`${PetsPluginID}+selectedClosePet`, true, {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})
