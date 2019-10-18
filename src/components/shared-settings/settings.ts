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

const createProxiedSettings = (key: string) => {
    const target: { [key: string]: ValueRef<string> | string } = {}
    MessageCenter.on('settingsCreated', p => {
        if (!(p in target)) {
            target[p] = createNetworkSpecificSettings<string>(p, key, '')
        }
    })
    return new Proxy(target, {
        get(target, p: string) {
            if (!(p in target)) {
                MessageCenter.emit('settingsCreated', p)
                target[p] = createNetworkSpecificSettings<string>(p, key, '')
            }
            return target[p]
        },
        set(target, p: string, value: string) {
            // @ts-ignore
            target[p].value = value
            return true
        },
    })
}

export const currentSelectedIdentity = createProxiedSettings('currentSelectedIdentity')
