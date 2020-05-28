import { ValueRef } from '@holoflows/kit'
import { MessageCenter } from '../../utils/messages'
import { setStorage, GeneralSettingsStorage, NetworkSpecificSettingsStorage, getStorage } from '../../storage/storage'

type SettingsStorage = Partial<GeneralSettingsStorage & NetworkSpecificSettingsStorage>
type SettingsStorageValue = SettingsStorage[keyof SettingsStorage]

export interface SettingsTexts {
    primary: () => string
    secondary?: () => string
}
export const texts = new WeakMap<ValueRef<any>, SettingsTexts>()

function createInternalSettings<T extends SettingsStorageValue>(
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

    async function updateStorage<T extends SettingsStorageValue>(newVal: T, initial: boolean = false) {
        const stored = await getStorage<SettingsStorage>(storage)
        if (!initial || (initial && !(key in stored))) {
            await setStorage<SettingsStorage>(storage, { [key]: newVal })
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
            const stored = await getStorage<SettingsStorage>(storage)
            if (typeof stored === 'object' && stored !== null && key in (stored as any)) {
                settings.value = Reflect.get(stored, key)
                ready()
            }
        }
    }
    return settings
}

export function createNewSettings<T extends SettingsStorageValue>(
    key: string,
    initialValue: T,
    UITexts: SettingsTexts,
    comparer: (a: T, b: T) => boolean = (a, b) => a === b,
) {
    const settings = createInternalSettings('settings', key, initialValue, comparer)
    texts.set(settings, UITexts)
    return settings
}

export function createNetworkSpecificSettings<T extends SettingsStorageValue>(
    network: string,
    key: string,
    initialValue: T,
    comparer: (a: T, b: T) => boolean = (a, b) => a === b,
) {
    return createInternalSettings(network, key, initialValue, comparer)
}
