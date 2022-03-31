import { ValueRef, isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import Services from '../extension/service'
import { MaskMessages } from '../utils/messages'
import { defer } from '@dimensiondev/kit'

export type InternalSettings<T> = ValueRef<T> & {
    readonly key: string
    readonly ready: boolean
    readonly readyPromise: Promise<T>
    readonly resolve: (value: T) => void
    readonly reject: (e: Error) => void
}
export type ValueComparer<T> = (a: T, b: T) => boolean
const defaultValueComparer = (a: any, b: any) => a === b

const cached: Map<string, InternalSettings<any>> = new Map()
const lastEventId: Map<string, number> = new Map()

if (isEnvironment(Environment.ManifestBackground)) {
    MaskMessages.events.createInternalSettingsChanged.on(async (payload) => {
        const { id, key, value, initial } = payload

        const stored = await Services.Helper.__deprecated__getStorage(key)
        if (!initial || (initial && typeof stored === 'undefined'))
            await Services.Helper.__deprecated__setStorage(key, value)

        const updated = await Services.Helper.__deprecated__getStorage(key)
        if (typeof updated === 'undefined') return
        MaskMessages.events.createInternalSettingsUpdated.sendToAll({
            id,
            key,
            value: updated,
            initial,
        })
    })
}

MaskMessages.events.createInternalSettingsUpdated.on(async (payload) => {
    const { id, key, value } = payload
    const settings = cached.get(key)
    if (!settings) return
    if ((lastEventId.get(key) ?? 0) > id) return
    settings.value = value
    settings.resolve(settings.value)
})

export function createComplexInternalSettings<T extends browser.storage.StorageValue>(
    key: string,
    value: T,
    comparer: ValueComparer<T>,
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

    readyPromise.then(() => {
        Object.assign(settings, {
            ready: true,
        })
    })

    const id = Date.now()
    cached.set(key, settings)
    lastEventId.set(key, id)
    MaskMessages.events.createInternalSettingsChanged.sendToAll({
        id,
        key,
        value,
        initial: true,
    })
    settings.addListener((newVal) => {
        const id = Date.now()
        lastEventId.set(key, id)
        MaskMessages.events.createInternalSettingsChanged.sendToAll({
            id,
            key,
            value: newVal,
            initial: false,
        })
    })
    return settings
}

export function createInternalSettings(key: string, defaultValue: number): InternalSettings<number>
export function createInternalSettings(key: string, defaultValue: string): InternalSettings<string>
export function createInternalSettings(key: string, defaultValue: boolean): InternalSettings<boolean>
export function createInternalSettings<T extends string | number>(key: string, defaultValue: T): InternalSettings<T>
export function createInternalSettings(key: string, defaultValue: any): InternalSettings<any> {
    return createComplexInternalSettings(key, defaultValue, defaultValueComparer)
}

export function createComplexGlobalSettings<T extends browser.storage.StorageValue>(
    key: string,
    value: T,
    comparer: ValueComparer<T>,
) {
    const settings = createComplexInternalSettings(`settings+${key}`, value, comparer)
    return settings
}
export function createGlobalSettings(key: string, defaultValue: number): InternalSettings<number>
export function createGlobalSettings(key: string, defaultValue: string): InternalSettings<string>
export function createGlobalSettings(key: string, defaultValue: boolean): InternalSettings<boolean>
export function createGlobalSettings<T extends string | number>(key: string, defaultValue: T): InternalSettings<T>
export function createGlobalSettings(key: string, defaultValue: any): InternalSettings<any> {
    return createComplexGlobalSettings(key, defaultValue, defaultValueComparer)
}

export interface NetworkSettings<T> {
    [networkKey: string]: ValueRef<T> & { ready: boolean; readyPromise: Promise<T> }
}

export function createComplexNetworkSettings<T extends browser.storage.StorageValue>(
    settingsKey: string,
    defaultValue: T,
    comparer: ValueComparer<T>,
) {
    const cached: NetworkSettings<T> = {}
    MaskMessages.events.createNetworkSettingsReady.on((networkKey) => {
        if (networkKey.startsWith('plugin:') || settingsKey === 'pluginsEnabled') return
        if (!(networkKey in cached))
            cached[networkKey] = createComplexInternalSettings(`${networkKey}+${settingsKey}`, defaultValue, comparer)
    })
    return new Proxy(cached, {
        get(target, networkKey: string) {
            if (!(networkKey in target)) {
                const settings = createComplexInternalSettings(`${networkKey}+${settingsKey}`, defaultValue, comparer)
                target[networkKey] = settings
                settings.readyPromise.then(() => MaskMessages.events.createNetworkSettingsReady.sendToAll(networkKey))
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
export function createNetworkSettings(key: string, defaultValue: number): NetworkSettings<number>
export function createNetworkSettings(key: string, defaultValue: string): NetworkSettings<string>
export function createNetworkSettings(key: string, defaultValue: boolean): NetworkSettings<boolean>
export function createNetworkSettings<T extends string | number>(key: string, defaultValue: T): NetworkSettings<T>
export function createNetworkSettings(key: string, defaultValue: any): NetworkSettings<any> {
    return createComplexNetworkSettings(key, defaultValue, defaultValueComparer)
}
