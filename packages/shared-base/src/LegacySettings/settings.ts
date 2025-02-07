import { isEqual } from 'lodash-es'
import { Appearance, LanguageOptions } from '@masknet/public-api'
import { createGlobalSettings, createBulkSettings } from './createSettings.js'
import { updateLanguage } from '../i18n/index.js'
import { BooleanPreference } from '../types.js'
import { NetworkPluginID } from '../types/PluginID.js'
import { EnhanceableSite, ExtensionSite } from '../Site/types.js'
import { SwitchLogoType } from '../types/SwitchLogo.js'
import { ValueRefWithReady, type PersonaIdentifier, ECKeyIdentifier } from '../index.js'

export const languageSettings = createGlobalSettings<LanguageOptions>('language', LanguageOptions.__auto__)
languageSettings.addListener(updateLanguage)
export const lastDatabaseCleanupTime = createGlobalSettings('lastDatabaseCleanupTime', 0)

export const pluginIDsSettings = createGlobalSettings<Record<EnhanceableSite | ExtensionSite, NetworkPluginID>>(
    'PluginIdBySite',
    {
        [EnhanceableSite.Twitter]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.Facebook]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.Instagram]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.OpenSea]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.Minds]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.Localhost]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.Mirror]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.Firefly]: NetworkPluginID.PLUGIN_EVM,
        [ExtensionSite.Popup]: NetworkPluginID.PLUGIN_EVM,
        [ExtensionSite.Dashboard]: NetworkPluginID.PLUGIN_EVM,
        [ExtensionSite.Swap]: NetworkPluginID.PLUGIN_EVM,
    },
    isEqual,
)

export const InjectSwitchSettings = createBulkSettings<boolean>('InjectSwitchBySite', true)

export const currentSetupGuideStatus = createBulkSettings('currentSetupGuideStatus', '')
export const userGuideStatus = createBulkSettings('userGuideStatus', '')
export const userGuideFinished = createBulkSettings('userGuideFinished', false)
export const sayHelloShowed = createBulkSettings('sayHelloShowed', false)
export const userPinExtension = createGlobalSettings('userPinExtension', false)
export const appearanceSettings = createGlobalSettings<Appearance>('appearance', Appearance.default)

/**
 * ! DO NOT use this directly to query the plugin status !
 *
 * use `useActivatedPluginsSiteAdaptor().find((x) => x.ID === PLUGIN_ID)`
 * @deprecated DO NOT EXPORT THIS
 */
// This was "currentPluginEnabled" before, but we used it to represent minimal mode now to make the settings be able to migrate.
const pluginMinimalModeReversed = createBulkSettings<boolean | 'enabled'>('pluginsEnabled', true)
export function getCurrentPluginMinimalMode(id: string) {
    if (pluginMinimalModeReversed['plugin:' + id].value === 'enabled') return BooleanPreference.False
    if (pluginMinimalModeReversed['plugin:' + id].value === false) return BooleanPreference.True
    return BooleanPreference.Default
}
export function setCurrentPluginMinimalMode(id: string, value: BooleanPreference) {
    if (value === BooleanPreference.Default) pluginMinimalModeReversed['plugin:' + id].value = true
    else if (value === BooleanPreference.True) pluginMinimalModeReversed['plugin:' + id].value = false
    else if (value === BooleanPreference.False) pluginMinimalModeReversed['plugin:' + id].value = 'enabled'
}
export const currentPersonaIdentifier = new ValueRefWithReady<PersonaIdentifier | undefined>(undefined)
{
    const currentPersonaIdentifier_raw = createGlobalSettings('currentPersonaIdentifier', '')
    currentPersonaIdentifier.addListener((newVal) => {
        currentPersonaIdentifier_raw.value = newVal?.toText() ?? ''
    })
    currentPersonaIdentifier_raw.addListener((newVal) => {
        currentPersonaIdentifier.value = newVal ? ECKeyIdentifier.from(newVal).unwrap() : undefined
    })
    currentPersonaIdentifier_raw.readyPromise.then(() => {
        const value = currentPersonaIdentifier_raw.value
        currentPersonaIdentifier.value = value ? ECKeyIdentifier.from(value).unwrap() : undefined
    })
}

try {
    // Migrate language settings
    const lng: string = languageSettings.value
    if (lng === 'en') languageSettings.value = LanguageOptions.enUS
    else if (lng === 'zh') languageSettings.value = LanguageOptions.zhCN
    else if (lng === 'ja') languageSettings.value = LanguageOptions.jaJP
    else if (lng === 'ko') languageSettings.value = LanguageOptions.koKR
    else languageSettings.value = LanguageOptions.__auto__
} catch {}

export const switchLogoSettings = createBulkSettings('SwitchLogo', SwitchLogoType.New)

export const hidingScamSettings = createGlobalSettings('hidingScam', true)
export const disablePermitSettings = createGlobalSettings('disablePermit', true)
