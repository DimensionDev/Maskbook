import stringify from 'json-stable-stringify'
import { createGlobalSettings, createNetworkSettings } from './createSettings'
import i18nNextInstance, { i18n } from '../utils/i18n-next'
import { sideEffect } from '../utils/side-effects'
import type { SetupGuideStep } from '../components/InjectedComponents/SetupGuide'
import { ChainId } from '../web3/types'

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
export enum Appearance {
    default = 'default',
    light = 'light',
    dark = 'dark',
}
export const appearanceSettings = createGlobalSettings<Appearance>('appearance', Appearance.default, {
    primary: () => i18n.t('settings_appearance'),
    secondary: () => i18n.t('settings_appearance_secondary'),
})
//#endregion

//#region chain state settings
export interface ChainState {
    chainId: ChainId
    blockNumber: number
}
export const currentChainStateSettings = createGlobalSettings<string>('chain state', stringify([]), {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})
//#endregion

//#region provider chain id
export const currentMaskbookChainIdSettings = createGlobalSettings<ChainId>('maskbook chain id', ChainId.Mainnet, {
    primary: () => i18n.t('settings_choose_eth_network'),
    secondary: () => 'This only affects the built-in wallet.',
})

export const currentMetaMaskChainIdSettings = createGlobalSettings<ChainId>('metamask chain id', ChainId.Mainnet, {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

export const currentWalletConnectChainIdSettings = createGlobalSettings<ChainId>(
    'walletconnect chain id',
    ChainId.Mainnet,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)
//#endregion

//#region language
export enum Language {
    zh = 'zh',
    en = 'en',
    ja = 'ja',
}
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

export const currentImagePayloadStatus = createNetworkSettings('currentImagePayloadStatus')
export const currentSelectedIdentity = createNetworkSettings('currentSelectedIdentity')

export type SetupGuideCrossContextStatus = {
    /** The persona to be connected */
    persona?: string
    /** The user name given by user */
    username?: string
    /** The WIP step */
    status?: SetupGuideStep
}
export const currentSetupGuideStatus = createNetworkSettings('currentSetupGuideStatus')
export const currentImportingBackup = createGlobalSettings<boolean>('importingBackup', false, {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

export enum LaunchPage {
    facebook = 'facebook',
    twitter = 'twitter',
    dashboard = 'dashboard',
}
export const launchPageSettings = createGlobalSettings<LaunchPage>('launchPage', LaunchPage.dashboard, {
    primary: () => i18n.t('settings_launch_page'),
    secondary: () => i18n.t('settings_launch_page_secondary'),
})

sideEffect.then(() => {
    // reset it to false after Maskbook startup
    currentImportingBackup.value = false
})
