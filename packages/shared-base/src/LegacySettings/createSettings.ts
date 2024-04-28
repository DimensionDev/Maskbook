import { type Option, None } from 'ts-results-es'
import { MaskMessages } from '../Messages/index.js'
import { type ValueRef, ValueRefWithReady, type ValueComparer } from '../helpers/index.js'

let getValue: (key: string) => Promise<Option<any>> = async () => {
    return None
}
export function setupLegacySettingsAtBackground(
    getStorage: (key: string) => Promise<any>,
    setStorage: (key: string, val: unknown) => Promise<void>,
) {
    getValue = getStorage
    MaskMessages.events.legacySettings_set.on(async (payload) => {
        const { key, value } = payload
        await setStorage(key, value)
        MaskMessages.events.legacySettings_broadcast.sendToAll({ key, value })
    })
}
export function setupLegacySettingsAtNonBackground(getStorage: (key: string) => Promise<Option<any>>) {
    getValue = getStorage
}

function setupValueRef<T>(settings: ValueRef<T>, key: string) {
    let duringInitialValueSet = false
    let duringBroadcastSet = false
    Promise.resolve()
        .then(() => getValue(key))
        .then((value) => {
            duringInitialValueSet = true
            if (value.isSome()) settings.value = value.value
            else if (settings instanceof ValueRefWithReady) settings.nowReady?.()
        })
        .finally(() => (duringInitialValueSet = false))

    MaskMessages.events.legacySettings_broadcast.on((payload) => {
        if (key !== payload.key) return
        duringBroadcastSet = true
        settings.value = payload.value
        duringBroadcastSet = false
    })

    settings.addListener((newVal) => {
        if (duringInitialValueSet || duringBroadcastSet) return
        MaskMessages.events.legacySettings_set.sendToAll({
            key,
            value: newVal,
        })
    })
    return settings
}

/** @deprecated */
export function createGlobalSettings<T>(key: string, value: T, comparer?: ValueComparer<T>) {
    const settings = new ValueRefWithReady(value, comparer)
    setupValueRef(settings, `settings+${key}`)
    return settings
}

/** @deprecated */
export function createBulkSettings<T>(settingsKey: string, defaultValue: T, comparer?: ValueComparer<T>) {
    const item: Record<string, ValueRefWithReady<T>> = { __proto__: null! }
    MaskMessages.events.legacySettings_bulkDiscoverNS.on((ns) => {
        if (ns.startsWith('plugin:') || settingsKey === 'pluginsEnabled') return
        setup(ns)
    })
    function setup(ns: string) {
        if (ns in item) return false
        const settings = new ValueRefWithReady(defaultValue, comparer)
        setupValueRef(settings, `${ns}+${settingsKey}`)
        item[ns] = settings
        return true
    }
    return new Proxy(item, {
        get(target, ns) {
            if (typeof ns !== 'string') return undefined
            // if we're the first one to access this property, notify all others to create this property too.
            if (setup(ns)) {
                target[ns].readyPromise.then(() => MaskMessages.events.legacySettings_bulkDiscoverNS.sendToAll(ns))
            }
            return target[ns]
        },
    })
}
