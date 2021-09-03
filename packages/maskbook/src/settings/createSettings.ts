import { ValueRef, isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import Services from '../extension/service'
import { MaskMessage } from '../utils/messages'
import { defer } from '../utils/utils'

export interface SettingsTexts {
    primary: () => string
    secondary?: () => string
}
export const texts = new WeakMap<ValueRef<any>, SettingsTexts>()

export type InternalSettings<T> = ValueRef<T> & {
    readonly key: string
    readonly ready: boolean
    readonly readyPromise: Promise<T>
    readonly resolve: (value: T) => void
    readonly reject: (e: Error) => void
}

const cached: Map<string, InternalSettings<any>> = new Map()
const lastEventId: Map<string, number> = new Map()

if (isEnvironment(Environment.ManifestBackground)) {
    MaskMessage.events.createInternalSettingsChanged.on(async (payload) => {
        const { id, key, value, initial } = payload

        const stored = await Services.Helper.getStorage(key)
        if (!initial || (initial && typeof stored === 'undefined')) await Services.Helper.setStorage(key, value)

        const updated = await Services.Helper.getStorage(key)
        if (typeof updated === 'undefined') return
        MaskMessage.events.createInternalSettingsUpdated.sendToAll({
            id,
            key,
            value: updated,
            initial,
        })
    })
}

MaskMessage.events.createInternalSettingsUpdated.on(async (payload) => {
    const { id, key, value } = payload
    const settings = cached.get(key)
    if (!settings) return
    if ((lastEventId.get(key) ?? 0) > id) return
    settings.value = value
    settings.resolve(settings.value)
})

export function createInternalSettings<T extends browser.storage.StorageValue>(
    key: string,
    value: T,
    comparer: (a: T, b: T) => boolean = (a, b) => a === b,
) {
    const settings = new ValueRef(value, comparer) as InternalSettings<T>
    const [readyPromise, resolve, reject] = defer<T>()
    Object.assign(settings, {
        key,
        ready: false,
        readyPromise,
        resolve,
        reject,
    })

    const id = Date.now()
    cached.set(key, settings)
    lastEventId.set(key, id)
    MaskMessage.events.createInternalSettingsChanged.sendToAll({
        id,
        key,
        value,
        initial: true,
    })
    settings.addListener((newVal) => {
        const id = Date.now()
        lastEventId.set(key, id)
        MaskMessage.events.createInternalSettingsChanged.sendToAll({
            id,
            key,
            value: newVal,
            initial: false,
        })
    })
    return settings
}

export function createGlobalSettings<T extends browser.storage.StorageValue>(
    key: string,
    value: T,
    UITexts: SettingsTexts,
    comparer: (a: T, b: T) => boolean = (a, b) => a === b,
) {
    const settings = createInternalSettings(`settings+${key}`, value, comparer)
    texts.set(settings, UITexts)
    return settings
}

export interface NetworkSettings<T> {
    [networkKey: string]: ValueRef<T> & { ready: boolean; readyPromise: Promise<T> }
}

export function createNetworkSettings<T extends browser.storage.StorageValue>(settingsKey: string, defaultValue: T) {
    const cached: NetworkSettings<T> = {}
    MaskMessage.events.createNetworkSettingsReady.on((networkKey) => {
        if (networkKey.startsWith('plugin:') || settingsKey === 'pluginsEnabled') return
        if (!(networkKey in cached))
            cached[networkKey] = createInternalSettings(`${networkKey}+${settingsKey}`, defaultValue)
    })
    return new Proxy(cached, {
        get(target, networkKey: string) {
            if (!(networkKey in target)) {
                const settings = createInternalSettings(`${networkKey}+${settingsKey}`, defaultValue)
                target[networkKey] = settings
                settings.readyPromise.then(() => MaskMessage.events.createNetworkSettingsReady.sendToAll(networkKey))
            }
            return target[networkKey]
        },
        set(target, settingKey: string, value: T) {
            const settings = target[settingKey]
            settings.value = value
            return true
        },
    })
}
