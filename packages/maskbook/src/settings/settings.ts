import { createGlobalSettings, createNetworkSettings, NetworkSettings } from './createSettings'
import { i18n } from '../utils/i18n-next'
import { sideEffect } from '../utils/side-effects'
import { LaunchPage } from './types'
import { Appearance } from '@masknet/theme'
import { LanguageOptions } from '@masknet/public-api'
import { Identifier, ProfileIdentifier } from '@masknet/shared-base'

/**
 * Does the debug mode on
 */
export const debugModeSetting = createGlobalSettings<boolean>('debugMode', false, {
    primary: () => i18n.t('settings_enable_debug'),
    secondary: () => i18n.t('settings_enable_debug_desc'),
})

/**
 * Whether if create substitute post for all posts
 */
export const allPostReplacementSettings = createGlobalSettings<boolean>('post replacement all', false, {
    primary: () => i18n.t('settings_post_replacement'),
    secondary: () => i18n.t('settings_post_replacement_desc'),
})

//#region appearance
export const appearanceSettings = createGlobalSettings<Appearance>('appearance', Appearance.default, {
    primary: () => i18n.t('settings_appearance'),
    secondary: () => i18n.t('settings_appearance_secondary'),
})
//#endregion

//#region language
export const languageSettings = createGlobalSettings<LanguageOptions>('language', LanguageOptions.__auto__, {
    primary: () => i18n.t('settings_language'),
    secondary: () => i18n.t('settings_language_secondary'),
})
//#endregion

//#region network setting

/**
 * Expected Usage：export const currentImagePayloadStatus = createNetworkSettings('currentImagePayloadStatus')
 *
 * Work around the issue:
 *      https://github.com/microsoft/TypeScript/issues/42873
 *      https://github.com/microsoft/TypeScript/issues/30858
 *
 * References:
 *      PluginGitcoinMessages: packages/maskbook/src/plugins/Gitcoin/messages.ts
 *      PluginTraderMessages: packages/maskbook/src/plugins/Trader/messages.ts
 *      PluginTransakMessages: packages/maskbook/src/plugins/Transak/messages.ts
 */
export const currentImagePayloadStatus: NetworkSettings<string> = createNetworkSettings('currentImagePayloadStatus', '')
export const currentSelectedIdentity: NetworkSettings<string> = createNetworkSettings('currentSelectedIdentity', '')
export function getCurrentSelectedIdentity(network: string) {
    return Identifier.fromString<ProfileIdentifier>(currentSelectedIdentity[network].value, ProfileIdentifier).unwrapOr(
        ProfileIdentifier.unknown,
    )
}
export const currentSetupGuideStatus: NetworkSettings<string> = createNetworkSettings('currentSetupGuideStatus', '')
// This is a misuse of concept "NetworkSettings" as "namespaced settings"
// The refactor is tracked in https://github.com/DimensionDev/Maskbook/issues/1884
/**
 * ! DO NOT use this directly to query the plugin status !
 *
 * use `useActivatedPluginsSNSAdaptor().find((x) => x.ID === PLUGIN_ID)` or
 * `useActivatedPluginsDashboard().find((x) => x.ID === PLUGIN_ID)` instead
 */
export const currentPluginEnabledStatus: NetworkSettings<boolean> = createNetworkSettings('pluginsEnabled', true)
export const currentImportingBackup = createGlobalSettings<boolean>('importingBackup', false, {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})
//#endregion

export const launchPageSettings = createGlobalSettings<LaunchPage>('launchPage', LaunchPage.dashboard, {
    primary: () => i18n.t('settings_launch_page'),
    secondary: () => i18n.t('settings_launch_page_secondary'),
})

export const newDashboardConnection = createGlobalSettings('beta-dashboard', false, {
    primary: () => 'Experimental: Allow isolated dashboard to connect',
    secondary: () => "WARNING: DON'T OPEN THIS UNLESS YOU KNOW WHAT YOU ARE DOING.",
})

export const currentPersonaIdentifier = createGlobalSettings<string>('currentPersonaIdentifier', '', {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

export const currentPopupWindowId = createGlobalSettings<number>('currentPopupWindowId', 0, {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

sideEffect.then(() => {
    // reset it to false after Mask startup
    currentImportingBackup.value = false

    // Migrate language settings
    const lng: string = languageSettings.value
    if (lng === 'en') languageSettings.value = LanguageOptions.enUS
    else if (lng === 'zh') languageSettings.value = LanguageOptions.zhCN
    else if (lng === 'ja') languageSettings.value = LanguageOptions.jaJP
    else if (lng === 'ko') languageSettings.value = LanguageOptions.koKR
    else languageSettings.value = LanguageOptions.__auto__
})
