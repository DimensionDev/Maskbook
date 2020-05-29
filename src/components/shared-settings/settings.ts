import { createNewSettings, createNetworkSpecificSettings } from './createSettings'
import type { ValueRef } from '@holoflows/kit/es'
import { MessageCenter } from '../../utils/messages'
import i18nNextInstance, { i18n } from '../../utils/i18n-next'
import { sideEffect } from '../../utils/side-effects'

/**
 * Does the debug mode on
 */
export const debugModeSetting = createNewSettings<boolean>('debugMode', false, {
    primary: () => i18n.t('settings_enable_debug'),
    secondary: () => i18n.t('settings_enable_debug_desc'),
})
/**
 * Never open a new tab in the background
 */
export const disableOpenNewTabInBackgroundSettings = createNewSettings<boolean>(
    'disable automated tab task open new tab',
    true,
    {
        primary: () => i18n.t('settings_disable_new_background_tab'),
        secondary: () => i18n.t('settings_disable_new_background_tab_desc'),
    },
)

const disableShadowRoot = webpackEnv.target === 'WKWebview' || process.env.STORYBOOK
export const renderInShadowRootSettings = createNewSettings<boolean>(
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

export enum Language {
    zh = 'zh',
    en = 'en',
}
const lang: string = i18nNextInstance.language
export const languageSettings = createNewSettings<Language>(
    'language',
    lang in Language ? (lang as Language) : Language.en,
    { primary: () => i18n.t('settings_language') },
)

const createProxiedSettings = (settingsKey: string) => {
    const target: {
        [key: string]: ValueRef<string> & {
            ready: boolean
            readyPromise: Promise<string>
        }
    } = {}
    MessageCenter.on('settingsCreated', (updatedKey) => {
        if (!(updatedKey in target)) {
            target[updatedKey] = createNetworkSpecificSettings(updatedKey, settingsKey, '')
        }
    })
    return new Proxy(target, {
        get(target, gettingKey: string) {
            if (!(gettingKey in target)) {
                const settings = createNetworkSpecificSettings<string>(gettingKey, settingsKey, '')
                target[gettingKey] = settings
                settings.readyPromise.then(() => {
                    MessageCenter.emit('settingsCreated', gettingKey)
                })
            }
            return target[gettingKey]
        },
        set(target, settingKey: string, value: string) {
            const obj = target[settingKey]
            obj.value = value
            return true
        },
    })
}

export const currentImagePayloadStatus = createProxiedSettings('currentImagePayloadStatus')

export const currentSelectedIdentity = createProxiedSettings('currentSelectedIdentity')
export type ImmersiveSetupCrossContextStatus = {
    status?: false | 'during'
    persona?: string
    username?: string
}
export const currentImmersiveSetupStatus = createProxiedSettings('currentImmersiveSetupStatus')
export const currentImportingBackup = createNewSettings<boolean>('importingBackup', false, {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

sideEffect.then(() => {
    // reset it to false after Maskbook startup
    currentImportingBackup.value = false
})
