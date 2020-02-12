import { createNewSettings, createNetworkSpecificSettings } from './createSettings'
import { ValueRef } from '@holoflows/kit/es'
import { MessageCenter } from '../../utils/messages'
import { geti18nString, getCurrentLanguage } from '../../utils/i18n'

/**
 * Does the debug mode on
 */
export const debugModeSetting = createNewSettings<boolean>('debugMode', false, {
    primary: () => geti18nString('settings_enable_debug'),
    secondary: () => geti18nString('settings_enable_debug_desc'),
})
/**
 * Dose steganography post mode on
 */
export const steganographyModeSetting = createNewSettings<boolean>('steganographyMode', false, {
    primary: () => geti18nString('settings_image_based_payload'),
    secondary: () => geti18nString('settings_image_based_payload_desc'),
})

/**
 * Never open a new tab in the background
 */
export const disableOpenNewTabInBackgroundSettings = createNewSettings<boolean>(
    'disable automated tab task open new tab',
    true,
    {
        primary: () => geti18nString('settings_disable_new_background_tab'),
        secondary: () => geti18nString('settings_disable_new_background_tab_desc'),
    },
)

export enum Language {
    zh = 'zh',
    en = 'en',
}
const lang = getCurrentLanguage()
export const languageSettings = createNewSettings<Language>(
    'language',
    lang in Language ? (lang as Language) : Language.en,
    { primary: () => geti18nString('settings_language') },
)

const createProxiedSettings = <T extends string = string>(settingsKey: string) => {
    const target: { [key: string]: ValueRef<string> } = {}
    MessageCenter.on('settingsCreated', updatedKey => {
        if (!(updatedKey in target)) {
            target[updatedKey] = createNetworkSpecificSettings<string>(updatedKey, settingsKey, '')
        }
    })
    return ((new Proxy(target, {
        get(target, gettingKey: string) {
            if (!(gettingKey in target)) {
                MessageCenter.emit('settingsCreated', gettingKey)
                target[gettingKey] = createNetworkSpecificSettings<string>(gettingKey, settingsKey, '')
            }
            return target[gettingKey]
        },
        set(target, settingKey: string, value: string) {
            const obj = target[settingKey]
            obj.value = value
            return true
        },
    }) as typeof target) as unknown) as { [key: string]: ValueRef<T> }
}

export const currentSelectedIdentity = createProxiedSettings('currentSelectedIdentity')
export type ImmersiveSetupCrossContextStatus = {
    status?: false | 'during'
    persona?: string
    username?: string
}
export const currentImmersiveSetupStatus = createProxiedSettings('currentImmersiveSetupStatus')
