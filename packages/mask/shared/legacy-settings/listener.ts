import {
    appearanceSettings,
    telemetrySettings,
    pluginIDSettings,
    languageSettings,
    currentPersonaIdentifier,
} from './settings.js'
import type { MaskSettingsEvents, ValueRefWithReady } from '@masknet/shared-base'

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
