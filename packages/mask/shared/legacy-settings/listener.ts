import { appearanceSettings, telemetrySettings } from './settings.js'
import {
    pluginIDSettings,
    type MaskSettingsEvents,
    type ValueRefWithReady,
    languageSettings,
    currentPersonaIdentifier,
} from '@masknet/shared-base'

type ToBeListedSettings = {
    [key in keyof MaskSettingsEvents]: ValueRefWithReady<MaskSettingsEvents[key]>
}
export function ToBeListened(): ToBeListedSettings {
    return {
        telemetrySettings,
        appearanceSettings,
        pluginIDSettings,
        languageSettings,
        currentPersonaIdentifier,
    }
}
