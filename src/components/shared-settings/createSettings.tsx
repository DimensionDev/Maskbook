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
): ValueRef<T> & { readonly ready: boolean; readonly readyPromise: Promise<void> } {
    const settings = new ValueRef(initialValue, comparer) as ValueRef<T> & {
        ready: boolean
        readonly readyPromise: Promise<void>
    }
    let ready: () => void = undefined!
    Object.assign(settings, {
        ready: false,
        readyPromise: new Promise(
            (resolve) =>
                (ready = () => {
                    resolve()
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
        const stored = ((await browser.storage.local.get(null))[storage] as object) || {}
        if (!initial || (initial && !(key in stored))) {
            await browser.storage.local.set({
                [storage]: { ...stored, [key]: newVal },
            })
            if (initial) {
                updateValueRef(`settings+${key}`)
            } else {
                MessageCenter.emit('settingsUpdated', instanceKey)
            }
        }
    }
    async function updateValueRef(receivedKey: string) {
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
