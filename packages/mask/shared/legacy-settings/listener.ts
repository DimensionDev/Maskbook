import {
    pluginIDsSettings,
    type MaskSettingsEvents,
    type ValueRefWithReady,
    languageSettings,
    currentPersonaIdentifier,
    appearanceSettings,
} from '@masknet/shared-base'
import { telemetrySettings } from '@masknet/web3-telemetry'

type ToBeListedSettings = {
    [key in keyof MaskSettingsEvents]: ValueRefWithReady<MaskSettingsEvents[key]>
}
export function ToBeListened(): ToBeListedSettings {
    return {
        telemetrySettings,
        appearanceSettings,
        pluginIDSettings: pluginIDsSettings,
        languageSettings,
        currentPersonaIdentifier,
    }
}
