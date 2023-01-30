import { ValueRefWithReady } from '@masknet/shared-base'
import { createGlobalSettings } from '../../../shared/legacy-settings/createSettings.js'
import { PetsPluginID } from './constants.js'

export const petShowSettings: ValueRefWithReady<boolean> = createGlobalSettings(
    `${PetsPluginID}+selectedClosePet`,
    true,
)
