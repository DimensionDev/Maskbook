import { appearanceSettings, pluginIDSettings, languageSettings, currentPersonaIdentifier } from './settings'
import type { MaskSettingsEvents } from '@masknet/shared-base'
import type { InternalSettings } from './createSettings'

type ToBeListedSettings = { [key in keyof MaskSettingsEvents]: InternalSettings<MaskSettingsEvents[key]> }
export function ToBeListened(): ToBeListedSettings {
    return {
        appearanceSettings,
        pluginIDSettings,
        languageSettings,
        currentPersonaIdentifier,
    }
}
