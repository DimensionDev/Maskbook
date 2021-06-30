import { createGlobalSettings, createNetworkSettings, NetworkSettingsCache } from './createSettings'
import i18nNextInstance, { i18n } from '../utils/i18n-next'
import { sideEffect } from '../utils/side-effects'
import { LaunchPage } from './types'
import { Appearance, Language } from '@masknet/theme'

/**
 * Does the debug mode on
 */
export const debugModeSetting = createGlobalSettings<boolean>('debugMode', false, {
    primary: () => i18n.t('settings_enable_debug'),
    secondary: () => i18n.t('settings_enable_debug_desc'),
})

/**
 * Never open a new tab in the background
 */
export const disableOpenNewTabInBackgroundSettings = createGlobalSettings<boolean>(
    'disable automated tab task open new tab',
    true,
    {
        primary: () => i18n.t('settings_ancient_post_compatibility_mode'),
        secondary: () => i18n.t('settings_ancient_post_compatibility_mode_desc'),
    },
)

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
const lang: string = i18nNextInstance.language
export const languageSettings = createGlobalSettings<Language>(
    'language',
    lang in Language ? (lang as Language) : Language.en,
    { primary: () => i18n.t('settings_language'), secondary: () => i18n.t('settings_language_secondary') },
)
//#endregion

export const enableGroupSharingSettings = createGlobalSettings<boolean>('experimental/group-sharing@sept2020', false, {
    primary: () => 'Experimental: Enable group sharing',
    secondary: () => '(Unstable) Automatically share posts to a group',
})

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
export const currentImagePayloadStatus: NetworkSettingsCache = createNetworkSettings('currentImagePayloadStatus')
export const currentSelectedIdentity: NetworkSettingsCache = createNetworkSettings('currentSelectedIdentity')
export const currentSetupGuideStatus: NetworkSettingsCache = createNetworkSettings('currentSetupGuideStatus')
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

sideEffect.then(() => {
    // reset it to false after Mask startup
    currentImportingBackup.value = false
})
