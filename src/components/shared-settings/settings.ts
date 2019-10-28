import { createNewSettings, createNetworkSpecificSettings } from './createSettings'
import { ValueRef } from '@holoflows/kit/es'
import { MessageCenter } from '../../utils/messages'

/**
 * Does the debug mode on
 */
export const debugModeSetting = createNewSettings<boolean>('debugMode', false, {
    primary: 'Enable debug mode',
    secondary: 'Enable this will display additional information on the Maskbook UI to help debugging',
})
/**
 * Never open a new tab in the background
 */
export const disableOpenNewTabInBackgroundSettings = createNewSettings<boolean>(
    'disable automated tab task open new tab',
    webpackEnv.firefoxVariant === 'GeckoView' || webpackEnv.target === 'WKWebview' ? true : false,
    {
        primary: 'Disable open hidden tabs in the background',
        secondary:
            "Many of Maskbook features relies on this behavior. Disable this behavior will limit Maskbook's functionality",
    },
)

const createProxiedSettings = (settingsKey: string) => {
    const target: { [key: string]: ValueRef<string> } = {}
    MessageCenter.on('settingsCreated', updatedKey => {
        if (!(updatedKey in target)) {
            target[updatedKey] = createNetworkSpecificSettings<string>(updatedKey, settingsKey, '')
        }
    })
    return new Proxy(target, {
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
    })
}

export const currentSelectedIdentity = createProxiedSettings('currentSelectedIdentity')
