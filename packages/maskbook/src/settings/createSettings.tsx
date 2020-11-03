import { ValueRef, GetContext } from '@dimensiondev/holoflows-kit'
import { MessageCenter } from '../utils/messages'
import { defer } from '../utils/utils'
import { getStorage, setStorage } from '../extension/background-script/StorageService'

export interface SettingsTexts {
    primary: () => string
    secondary?: () => string
}
export const texts = new WeakMap<ValueRef<any>, SettingsTexts>()

type InternalSettings<T> = ValueRef<T> & {
    readonly key: string
    readonly ready: boolean
    readonly readyPromise: Promise<T>
    readonly resolve: (value: T) => void
    readonly reject: (e: Error) => void
}

const cached: Map<string, InternalSettings<any>> = new Map()
const lastEventId: Map<string, number> = new Map()

if (GetContext() === 'background') {
    MessageCenter.on('settingsChanged', async (payload) => {
        const { id, key, value, initial } = payload
        const stored = await getStorage(key)
        if (!initial || (initial && typeof stored === 'undefined')) await setStorage(key, value)

        const updated = await getStorage(key)
        if (typeof updated === 'undefined') return
        MessageCenter.emit('settingsUpdated', {
            id,
            key,
            value: updated,
            initial,
            context: GetContext(),
        })
    })
}

MessageCenter.on('settingsUpdated', async (payload) => {
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
    MessageCenter.emit('settingsChanged', {
        id,
        key,
        value,
        initial: true,
        context: GetContext(),
    })
    settings.addListener((newVal) => {
        const id = Date.now()
        lastEventId.set(key, id)
        MessageCenter.emit('settingsChanged', {
            id,
            key,
            value: newVal,
            initial: false,
            context: GetContext(),
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

export function createNetworkSettings(settingsKey: string) {
    const cached: {
        [networkKey: string]: ValueRef<string> & {
            ready: boolean
            readyPromise: Promise<string>
        }
    } = {}
    MessageCenter.on('settingsCreated', (networkKey) => {
        if (!(networkKey in cached)) cached[networkKey] = createInternalSettings(`${networkKey}+${settingsKey}`, '')
    })
    return new Proxy(cached, {
        get(target, networkKey: string) {
            if (!(networkKey in target)) {
                const settings = createInternalSettings(`${networkKey}+${settingsKey}`, '')
                target[networkKey] = settings
                settings.readyPromise.then(() => MessageCenter.emit('settingsCreated', networkKey))
            }
            return target[networkKey]
        },
        set(target, settingKey: string, value: string) {
            const settings = target[settingKey]
            settings.value = value
            return true
        },
    })
}
