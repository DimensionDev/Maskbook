import { isEqual } from 'lodash-es'
import { Appearance } from '@masknet/theme'
import { LanguageOptions } from '@masknet/public-api'
import { EnhanceableSite, ExtensionSite, updateLanguage, NetworkPluginID } from '@masknet/shared-base'
import { BooleanPreference } from '@masknet/plugin-infra'
import { Sentry } from '@masknet/web3-providers'
import { createGlobalSettings, createBulkSettings } from './createSettings.js'

export const appearanceSettings = createGlobalSettings<Appearance>('appearance', Appearance.default)

export const languageSettings = createGlobalSettings<LanguageOptions>('language', LanguageOptions.__auto__)
languageSettings.addListener(updateLanguage)

export const telemetrySettings = createGlobalSettings<boolean>('log', false)
telemetrySettings.addListener((x) => (x ? Sentry.enable() : Sentry.disable()))

export const pluginIDSettings = createGlobalSettings<Record<EnhanceableSite | ExtensionSite, NetworkPluginID>>(
    'PluginIdBySite',
    {
        [EnhanceableSite.Twitter]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.Facebook]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.Instagram]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.OpenSea]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.Minds]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.Localhost]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.Mirror]: NetworkPluginID.PLUGIN_EVM,
        [ExtensionSite.Popup]: NetworkPluginID.PLUGIN_EVM,
        [ExtensionSite.Dashboard]: NetworkPluginID.PLUGIN_EVM,
        [ExtensionSite.PopupConnect]: NetworkPluginID.PLUGIN_EVM,
    },
    isEqual,
)

export const currentSetupGuideStatus = createBulkSettings('currentSetupGuideStatus', '')
export const userGuideStatus = createBulkSettings('userGuideStatus', '')
export const sayHelloShowed = createBulkSettings('sayHelloShowed', false)
export const userPinExtension = createGlobalSettings('userPinExtension', false)
export const dismissVerifyNextID = createBulkSettings<Record<string, boolean>>('dismissVerifyNextID', {}, isEqual)
export const decentralizedSearchSettings = createGlobalSettings('decentralizedSearchSettings', true)

/**
 * ! DO NOT use this directly to query the plugin status !
 *
 * use `useActivatedPluginsSNSAdaptor().find((x) => x.ID === PLUGIN_ID)` or
 * `useActivatedPluginsDashboard().find((x) => x.ID === PLUGIN_ID)` instead
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
export const currentPersonaIdentifier = createGlobalSettings('currentPersonaIdentifier', '')

try {
    // Migrate language settings
    const lng: string = languageSettings.value
    if (lng === 'en') languageSettings.value = LanguageOptions.enUS
    else if (lng === 'zh') languageSettings.value = LanguageOptions.zhCN
    else if (lng === 'ja') languageSettings.value = LanguageOptions.jaJP
    else if (lng === 'ko') languageSettings.value = LanguageOptions.koKR
    else languageSettings.value = LanguageOptions.__auto__
} catch {}
