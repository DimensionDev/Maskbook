import { ValueRef, isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import Services from '../extension/service'
import { MaskMessages } from '../utils/messages'
import { defer } from '@masknet/shared-base'
import { getEnumAsArray } from '@dimensiondev/kit'
import { SocialNetworkID } from '../../shared/types'

export interface SettingsTexts {
    primary: () => string
    secondary?: () => string
}
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

export function createGlobalSettings<T extends browser.storage.StorageValue>(
    key: string,
    value: T,
    UITexts: SettingsTexts,
    comparer: (a: T, b: T) => boolean = (a, b) => a === b,
) {
    const settings = createInternalSettings(`settings+${key}`, value, comparer)
    return settings
}

export interface SocialNetworkSettings<T> {
    [networkKey: string]: ValueRef<T> & { ready: boolean; readyPromise: Promise<T> }
}

export function createSocialNetworkSettings<T extends browser.storage.StorageValue>(
    settingsKey: string,
    defaultValue: T,
) {
    const cached: SocialNetworkSettings<T> = {}

    // setup initial value
    getEnumAsArray(SocialNetworkID).forEach(({ value }) => {
        cached[value] = createInternalSettings(`${value}+${settingsKey}`, defaultValue)
    })

    // sync by remote updates
    MaskMessages.events.createNetworkSettingsReady.on((networkKey) => {
        if (networkKey.startsWith('plugin:') || settingsKey === 'pluginsEnabled') return
        if (!(networkKey in cached))
            cached[networkKey] = createInternalSettings(`${networkKey}+${settingsKey}`, defaultValue)
    })

    // get or set by local updates
    return new Proxy(cached, {
        get(target, networkKey: string) {
            if (!(networkKey in target)) {
                const settings = createInternalSettings(`${networkKey}+${settingsKey}`, defaultValue)
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
