import { createGlobalSettings, createNetworkSettings } from './createSettings'
import i18nNextInstance, { i18n } from '../utils/i18n-next'
import { sideEffect } from '../utils/side-effects'
import { EthereumNetwork } from '../plugins/Wallet/database/types'

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
        primary: () => i18n.t('settings_disable_new_background_tab'),
        secondary: () => i18n.t('settings_disable_new_background_tab_desc'),
    },
)

const disableShadowRoot = webpackEnv.target === 'WKWebview' || process.env.STORYBOOK
export const renderInShadowRootSettings = createGlobalSettings<boolean>(
    'render in shadow root',
    /**
     * ? In WKWebview, the web extension polyfill is not ready for it.
     */
    !disableShadowRoot,
    {
        primary: () => i18n.t('settings_advance_security'),
        secondary: () => i18n.t('settings_advance_security_desc'),
    },
)

export enum Appearance {
    default = 'default',
    light = 'light',
    dark = 'dark',
}
const appearance = Appearance.default
export const appearanceSettings = createGlobalSettings<Appearance>('apperance', appearance, {
    primary: () => i18n.t('settings_appearance'),
})

export const currentEthereumNetworkSettings = createGlobalSettings<EthereumNetwork>(
    'eth network',
    EthereumNetwork.Mainnet,
    {
        primary: () => i18n.t('settings_choose_eth_network'),
        secondary: () =>
            `You can choose ${EthereumNetwork.Mainnet}, ${EthereumNetwork.Rinkeby} or ${EthereumNetwork.Ropsten}`,
    },
)

export enum Language {
    zh = 'zh',
    en = 'en',
}
const lang: string = i18nNextInstance.language
export const languageSettings = createGlobalSettings<Language>(
    'language',
    lang in Language ? (lang as Language) : Language.en,
    { primary: () => i18n.t('settings_language') },
)

export const currentImagePayloadStatus = createNetworkSettings('currentImagePayloadStatus')
export const currentImageEncryptStatus = createNetworkSettings('currentImageEncryptStatus')
export const currentSelectedIdentity = createNetworkSettings('currentSelectedIdentity')

export type ImmersiveSetupCrossContextStatus = {
    status?: false | 'during'
    persona?: string
    username?: string
}
export const currentImmersiveSetupStatus = createNetworkSettings('currentImmersiveSetupStatus')
export const currentImportingBackup = createGlobalSettings<boolean>('importingBackup', false, {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

sideEffect.then(() => {
    // reset it to false after Maskbook startup
    currentImportingBackup.value = false
})
