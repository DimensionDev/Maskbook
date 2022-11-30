import {
    appearanceSettings,
    enableLog,
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
        logSettings: enableLog,
        appearanceSettings,
        pluginIDSettings,
        languageSettings,
        currentPersonaIdentifier,
    }
}
