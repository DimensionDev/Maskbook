import { isEqual } from 'lodash-unified'
import { Appearance } from '@masknet/theme'
import { LanguageOptions } from '@masknet/public-api'
import { EnhanceableSite, ExtensionSite, updateLanguage } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { LaunchPage } from './types'
import {
    createGlobalSettings,
    createNetworkSettings,
    createComplexNetworkSettings,
    createComplexGlobalSettings,
} from './createSettings'

export const appearanceSettings = createGlobalSettings<Appearance>('appearance', Appearance.default)
export const languageSettings = createGlobalSettings<LanguageOptions>('language', LanguageOptions.__auto__)
languageSettings.addListener(updateLanguage)
export const pluginIDSettings = createComplexGlobalSettings<Record<EnhanceableSite | ExtensionSite, NetworkPluginID>>(
    'PluginIdBySite',
    {
        [EnhanceableSite.Twitter]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.Facebook]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.Instagram]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.OpenSea]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.Minds]: NetworkPluginID.PLUGIN_EVM,
        [EnhanceableSite.Localhost]: NetworkPluginID.PLUGIN_EVM,
        [ExtensionSite.Popup]: NetworkPluginID.PLUGIN_EVM,
        [ExtensionSite.Dashboard]: NetworkPluginID.PLUGIN_EVM,
    },
    isEqual,
)
export const userGuideVersion = createGlobalSettings('userGuideVersion', 'v2')

export const currentSetupGuideStatus = createNetworkSettings('currentSetupGuideStatus', '')
export const userGuideStatus = createNetworkSettings('userGuideStatus', '')
export const sayHelloShowed = createNetworkSettings('sayHelloShowed', false)
export const userPinExtension = createGlobalSettings('userPinExtension', false)
export const dismissVerifyNextID = createComplexNetworkSettings(
    'dismissVerifyNextID',
    {} as Record<string, boolean>,
    isEqual,
)
export const bioDescription = createNetworkSettings('bioDescription', '')
export const personalHomepage = createNetworkSettings('personalHomepage', '')
// This is a misuse of concept "NetworkSettings" as "namespaced settings"
// The refactor is tracked in https://github.com/DimensionDev/Maskbook/issues/1884
/**
 * ! DO NOT use this directly to query the plugin status !
 *
 * use `useActivatedPluginsSNSAdaptor().find((x) => x.ID === PLUGIN_ID)` or
 * `useActivatedPluginsDashboard().find((x) => x.ID === PLUGIN_ID)` instead
 */
// This was "currentPluginEnabled" before, but we used it to represent minimal mode now to make the settings be able to migrate.
export const currentPluginMinimalModeNOTEnabled = createNetworkSettings('pluginsEnabled', true)
export const launchPageSettings = createGlobalSettings<LaunchPage>('launchPage', LaunchPage.dashboard)
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
