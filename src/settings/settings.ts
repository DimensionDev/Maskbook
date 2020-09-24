import { createGlobalSettings, createInternalSettings, createNetworkSettings } from './createSettings'
import i18nNextInstance, { i18n } from '../utils/i18n-next'
import { sideEffect } from '../utils/side-effects'
import type { SetupGuideStep } from '../components/InjectedComponents/SetupGuide'
import { Flags } from '../utils/flags'
import { ChainId } from '../web3/types'
import { ProviderType } from '../web3/types'

/**
 * The id of last activated tab
 */
export const lastActivatedTabIdSettings = createGlobalSettings<string>('lastActiveTabId', '', {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

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

export const renderInShadowRootSettings = createGlobalSettings<boolean>(
    'render in shadow root',
    !Flags.no_ShadowDOM_support,
    {
        primary: () => i18n.t('settings_advance_security'),
        secondary: () => i18n.t('settings_advance_security_desc'),
    },
)

/**
 * Whether if create substitute post for all posts
 */
export const allPostReplacementSettings = createGlobalSettings<boolean>('post replacement all', false, {
    primary: () => i18n.t('settings_post_replacement'),
    secondary: () => i18n.t('settings_post_replacement_desc'),
})

export enum Appearance {
    default = 'default',
    light = 'light',
    dark = 'dark',
}
const appearance = Appearance.default
export const appearanceSettings = createGlobalSettings<Appearance>('apperance', appearance, {
    primary: () => i18n.t('settings_appearance'),
})

//#region provider chain id
export const currentMaskbookChainIdSettings = createGlobalSettings<ChainId>('maskbook chain id', ChainId.Mainnet, {
    primary: () => i18n.t('settings_choose_eth_network'),
    secondary: () => 'This only effects the built-in wallet.',
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

export const lastActivatedWalletProvider = createInternalSettings<ProviderType>(
    'last activated wallet provider',
    ProviderType.Maskbook,
)

export enum Language {
    zh = 'zh',
    en = 'en',
    ja = 'ja',
}
const lang: string = i18nNextInstance.language
export const languageSettings = createGlobalSettings<Language>(
    'language',
    lang in Language ? (lang as Language) : Language.en,
    { primary: () => i18n.t('settings_language') },
)

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

sideEffect.then(() => {
    // reset it to false after Maskbook startup
    currentImportingBackup.value = false
})
