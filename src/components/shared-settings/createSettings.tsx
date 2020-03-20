import { ValueRef } from '@holoflows/kit/es'
import { MessageCenter } from '../../utils/messages'

export interface SettingsTexts {
    primary: () => string
    secondary?: () => string
}
export const texts = new WeakMap<ValueRef<any>, SettingsTexts>()

function createInternalSettings<T extends browser.storage.StorageValue>(
    storage: string,
    key: string,
    initialValue: T,
    comparer: (a: T, b: T) => boolean = (a, b) => a === b,
): ValueRef<T> & { readonly ready: boolean; readonly readyPromise: Promise<void> } {
    const settings = new ValueRef(initialValue, comparer) as ValueRef<T> & {
        ready: boolean
        readonly readyPromise: Promise<void>
    }
    let ready: () => void = () => {}
    Object.assign(settings, {
        ready: false,
        readyPromise: new Promise(
            resolve =>
                (ready = () => {
                    resolve()
                    settings.ready = true
                }),
        ),
    })

    const instanceKey = `${storage}+${key}`
    update(instanceKey)

    settings.addListener(async newVal => {
        const stored = ((await browser.storage.local.get(null))[storage] as object) || {}
        await browser.storage.local.set({
            [storage]: { ...stored, [key]: newVal },
        })
        MessageCenter.emit('settingsUpdated', instanceKey)
    })
    MessageCenter.on('settingsUpdated', update)
    async function update(receivedKey: string) {
        if (receivedKey !== instanceKey) return
        if (typeof browser === 'object') {
            const value = await browser.storage.local.get(null)
            const stored = value[storage]
            if (typeof stored === 'object' && stored !== null && key in (stored as any)) {
                settings.value = Reflect.get(stored, key)
                ready()
            }
        }
    }
    return settings
}

export function createNewSettings<T extends browser.storage.StorageValue>(
    key: string,
    initialValue: T,
    UITexts: SettingsTexts,
    comparer: (a: T, b: T) => boolean = (a, b) => a === b,
) {
    const settings = createInternalSettings('settings', key, initialValue, comparer)
    texts.set(settings, UITexts)
    return settings
}

export function createNetworkSpecificSettings<T extends browser.storage.StorageValue>(
    network: string,
    key: string,
    initialValue: T,
    comparer: (a: T, b: T) => boolean = (a, b) => a === b,
) {
    return createInternalSettings(network, key, initialValue, comparer)
}
