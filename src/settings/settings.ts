import { createGlobalSettings, createInternalSettings, createNetworkSettings } from './createSettings'
import i18nNextInstance, { i18n } from '../utils/i18n-next'
import { sideEffect } from '../utils/side-effects'
import { EthereumNetwork } from '../plugins/Wallet/database/types'
import type { SetupGuideStep } from '../components/InjectedComponents/ImmersiveGuide/SetupGuide'
import { WalletProviderType } from '../plugins/shared/findOutProvider'
import { Flags } from '../utils/flags'

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

export enum Appearance {
    default = 'default',
    light = 'light',
    dark = 'dark',
}
const appearance = Appearance.default
export const appearanceSettings = createGlobalSettings<Appearance>('apperance', appearance, {
    primary: () => i18n.t('settings_appearance'),
})

export enum WholePostVisibility {
    all = 'all',
    enhancedOnly = 'enhancedOnly',
    encryptedOnly = 'encryptedOnly',
}

export const currentWholePostVisibilitySettings = createGlobalSettings<WholePostVisibility>(
    'whole post visibility',
    WholePostVisibility.all,
    {
        primary: () => 'Whole Post Visibility',
        secondary: () => '',
    },
)

export const currentLocalWalletEthereumNetworkSettings = createGlobalSettings<EthereumNetwork>(
    'eth network',
    EthereumNetwork.Mainnet,
    {
        primary: () => i18n.t('settings_choose_eth_network'),
        secondary: () =>
            `You can choose ${EthereumNetwork.Mainnet}, ${EthereumNetwork.Rinkeby} or ${EthereumNetwork.Ropsten}. This only effects the built-in wallet.`,
    },
)

export const lastActivatedWalletProvider = createInternalSettings<WalletProviderType>(
    'last activated wallet provider',
    WalletProviderType.managed,
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

export type ImmersiveSetupCrossContextStatus = {
    /** The persona to be connected */
    persona?: string
    /** The user name given by user */
    username?: string
    /** The WIP step */
    status?: SetupGuideStep
}
export const currentImmersiveSetupStatus = createNetworkSettings('currentImmersiveSetupStatus')
export const currentImportingBackup = createGlobalSettings<boolean>('importingBackup', false, {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

sideEffect.then(() => {
    // reset it to false after Maskbook startup
    currentImportingBackup.value = false
})
