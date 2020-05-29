import { ValueRef } from '@holoflows/kit'
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
): ValueRef<T> & { readonly ready: boolean; readonly readyPromise: Promise<T> } {
    const settings = new ValueRef(initialValue, comparer) as ValueRef<T> & {
        ready: boolean
        readonly readyPromise: Promise<T>
    }
    let ready: () => void = undefined!
    Object.assign(settings, {
        ready: false,
        readyPromise: new Promise<T>(
            (resolve) =>
                (ready = () => {
                    resolve(settings.value)
                    settings.ready = true
                }),
        ),
    })

    const instanceKey = `${storage}+${key}`
    updateStorage(initialValue, true)
    updateValueRef(instanceKey)
    settings.addListener((newVal) => updateStorage(newVal, false))
    MessageCenter.on('settingsUpdated', updateValueRef)

    async function updateStorage<T extends browser.storage.StorageValue>(newVal: T, initial: boolean = false) {
        const stored = await browser.storage.local.get(instanceKey)
        if (!initial || (initial && !(instanceKey in stored))) {
            await browser.storage.local.set({
                [instanceKey]: newVal,
            })
            if (initial) {
                updateValueRef(instanceKey)
            } else {
                MessageCenter.emit('settingsUpdated', instanceKey)
            }
        }
    }
    async function updateValueRef(receivedKey: string) {
        if (receivedKey !== instanceKey) return
        if (typeof browser === 'object') {
            const stored = await browser.storage.local.get(instanceKey)
            if (instanceKey in stored) {
                settings.value = Reflect.get(stored, instanceKey)
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
