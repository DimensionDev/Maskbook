import { ValueRef } from '@dimensiondev/holoflows-kit'
import { defer } from '@dimensiondev/kit'
import { MaskMessages } from '../messages'

/** @deprecated */
export type InternalSettings<T> = ValueRef<T> & {
    readonly key: string
    readonly ready: boolean
    readonly readyPromise: Promise<T>
    readonly resolve: (value: T) => void
    readonly reject: (e: Error) => void
}

/** @deprecated */
export type ValueComparer<T> = (a: T, b: T) => boolean
const defaultValueComparer = (a: any, b: any) => a === b

const cached: Map<string, InternalSettings<any>> = new Map()
const lastEventId: Map<string, number> = new Map()

export function setupLegacySettingsAtBackground(
    __deprecated__getStorage: (key: string) => Promise<unknown>,
    __deprecated__setStorage: (key: string, val: browser.storage.StorageValue) => Promise<void>,
) {
    MaskMessages.events.createInternalSettingsChanged.on(async (payload) => {
        const { id, key, value, initial } = payload

        const stored = await __deprecated__getStorage(key)
        if (!initial || (initial && typeof stored === 'undefined')) await __deprecated__setStorage(key, value)

        const updated = await __deprecated__getStorage(key)
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

function createComplexInternalSettings<T extends browser.storage.StorageValue>(
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

/** @deprecated */
export function createInternalSettings(key: string, defaultValue: number): InternalSettings<number>
export function createInternalSettings(key: string, defaultValue: string): InternalSettings<string>
export function createInternalSettings(key: string, defaultValue: boolean): InternalSettings<boolean>
export function createInternalSettings<T extends string | number>(key: string, defaultValue: T): InternalSettings<T>
export function createInternalSettings(key: string, defaultValue: any): InternalSettings<any> {
    return createComplexInternalSettings(key, defaultValue, defaultValueComparer)
}

/**
 * @deprecated
 * @internal
 */
export function createComplexGlobalSettings<T extends browser.storage.StorageValue>(
    key: string,
    value: T,
    comparer: ValueComparer<T>,
) {
    const settings = createComplexInternalSettings(`settings+${key}`, value, comparer)
    return settings
}

/** @deprecated */
export function createGlobalSettings(key: string, defaultValue: number): InternalSettings<number>
/** @deprecated */
export function createGlobalSettings(key: string, defaultValue: string): InternalSettings<string>
/** @deprecated */
export function createGlobalSettings(key: string, defaultValue: boolean): InternalSettings<boolean>
/** @deprecated */
export function createGlobalSettings<T extends string | number>(key: string, defaultValue: T): InternalSettings<T>
/** @deprecated */
export function createGlobalSettings(key: string, defaultValue: any): InternalSettings<any> {
    return createComplexGlobalSettings(key, defaultValue, defaultValueComparer)
}

/** @deprecated */
export interface NetworkSettings<T> {
    [networkKey: string]: ValueRef<T> & { ready: boolean; readyPromise: Promise<T> }
}

/**
 * @deprecated
 * @internal
 */
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

/**
 * @deprecated
 * @internal
 */
export function createNetworkSettings(key: string, defaultValue: number): NetworkSettings<number>
/**
 * @deprecated
 * @internal
 */
export function createNetworkSettings(key: string, defaultValue: string): NetworkSettings<string>
/**
 * @deprecated
 * @internal
 */
export function createNetworkSettings(key: string, defaultValue: boolean): NetworkSettings<boolean>
/**
 * @deprecated
 * @internal
 */
export function createNetworkSettings<T extends string | number>(key: string, defaultValue: T): NetworkSettings<T>
/**
 * @deprecated
 * @internal
 */
export function createNetworkSettings(key: string, defaultValue: any): NetworkSettings<any> {
    return createComplexNetworkSettings(key, defaultValue, defaultValueComparer)
}
