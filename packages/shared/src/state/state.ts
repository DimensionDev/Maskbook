import type { EventBasedChannel } from 'async-call-rpc'
import type { NamespacedBinding, PersistentStateStore } from './known'
export interface StateDetail<T> {
    /** defaultValue of the state */
    defaultValue: T
    type: 'global' | 'namespace'
    /**
     * Should this item be stored in the host or it will be dropped once the host goes offline
     * @defaultValue false
     */
    persistent: boolean
    isValidValue?(val: unknown): boolean
    /** If this is set, this state will be treated as a "visible" one (e.g. appears in the settings page.) */
    i18n?: {
        /** If the client failed to find the string, here is the fallback */
        fallbackString: string
        /** The i18n key for this state. */
        key: string
    }
}
export type HostConfig = {
    getPersistentedState(namespace: string | null, name: string): Promise<unknown>
    setPersistentedState(namespace: string | null, name: string, value: unknown): Promise<unknown>
    /** It should broadcast messages to all clients */
    channel: EventBasedChannel
}

export type HostReturn = {
    registerState(uniqueKey: string, detail: StateDetail<unknown>): void
}
import { isEqual } from 'lodash-es'

/**
 * Only call this in the background page, thanks!
 */
export function createStateHost({ channel, getPersistentedState, setPersistentedState }: HostConfig): HostReturn {
    const definitions = new Map<string, StateDetail<unknown>>()
    type InternalState = {
        ready: boolean
        readonly readyPromise: Promise<void>
        version: number
        value: unknown
        resolve(): void
    }
    const store = new Map<string, InternalState>()
    channel.on((data) => {
        if (!isInternalMessage(data)) return
        if (data[0] === InternalMessageTypeEnum.syncRequest) {
            publishUnqualifiedValue(data[1])
            return
        } else if (data[0] === InternalMessageTypeEnum.sync) {
            const [, unqualifiedKey, value] = data
            const state = store.get(unqualifiedKey)!
            // skip update
            if (state.ready && isEqual(state.value, value)) return

            const qualifiedName = getQualifiedName(unqualifiedKey)
            const def = definitions.get(qualifiedName[1])!
            const isValid =
                def.isValidValue &&
                (def.isValidValue(value) ||
                    console.warn('An invalid write to the ', ...qualifiedName, 'which value is', value))
            if (isValid) {
                if (def.persistent) {
                    setPersistentedState(...qualifiedName, value).catch((e) =>
                        console.error('Failed to store state:', ...qualifiedName, e),
                    )
                }
                writeUnqualifiedState(unqualifiedKey, value)
            }
            publishUnqualifiedValue(unqualifiedKey)
        }
    })
    return {
        registerState(uniqueKey, detail) {
            if (definitions.has(uniqueKey)) throw new TypeError('No duplicated state name.')
            definitions.set(uniqueKey, detail)
            initState(uniqueKey, detail)
        },
    }
    function publishUnqualifiedValue(key: string) {
        const state = store.get(key)
        if (!state) return
        state.readyPromise.then(() => channel.send(makeSyncMessage(key, store.get(key)!.value)))
    }
    function initState(key: string, detail: StateDetail<unknown>) {
        if (detail.persistent) {
            let resolve: any
            const readyPromise = new Promise<void>((r, reject) => {
                resolve = r
                loadPersistentState(key, detail).then(r, reject)
            })
            store.set(key, {
                ready: false,
                readyPromise,
                resolve,
                value: detail.defaultValue,
                version: Date.now(),
            })
        } else {
            store.set(key, {
                ready: true,
                readyPromise: Promise.resolve(),
                resolve: () => {},
                value: detail.defaultValue,
                version: Date.now(),
            })
        }
        // Send sync signal
        store.get(key)!.readyPromise.then(() => {
            channel.send(makeSyncMessage(key, store.get(key)!.value))
        })
    }
    async function loadPersistentState(key: string, detail: StateDetail<unknown>) {
        const value = await getPersistentedState(...getQualifiedName(key)).catch((e) => {
            console.error(`Internal state ${key} failed to fetch the persistent value.`, e)
            return detail.defaultValue
        })
        writeUnqualifiedState(key, value)
    }
    function writeUnqualifiedState(key: string, value: unknown) {
        const state = store.get(key)!
        state.value = value
        state.version = Date.now()
        state.ready = true
        state.resolve()
    }
}

export type ClientReturn = {
    globalBindings: {
        [key in keyof PersistentStateStore]: Readonly<StateBinding<PersistentStateStore[key]>>
    }
    createNamespacedBinding(namespace: string): {
        [key in keyof NamespacedBinding]: Readonly<StateBinding<NamespacedBinding>>
    }
}
export type StateBinding<T> = {
    ready: boolean
    readyPromise: Promise<void>
    /** Value IS undefined if this state binding is NOT ready and there is NO default value in the ClientConfig. */
    value: T
    addListener(callback: (newValue: T, oldValue: T) => void): void
    // This is important for concurrent-mode safe,
    // the version-value pair must be immutable so it's safe to create a snapshot
    version: number
}
type All = PersistentStateStore & NamespacedBinding
export type ClientConfig = {
    channel: EventBasedChannel
    defaultValues?: Partial<{ [key in keyof All]: All[key] }>
}
/**
 *
 * @param connection A connection that connects to the settings store
 */
export function createStateClient({ channel, defaultValues }: ClientConfig): ClientReturn {
    const states = new Map<string, StateBinding<unknown>>()
    channel.on((data) => {
        if (!isInternalMessage(data)) return
        if (data[0] === InternalMessageTypeEnum.sync) {
            getBinding(...getQualifiedName(data[1])).setNewValue(data[2])
        }
    })
    function getBinding(ns: string | null, key: string) {
        const unqualifiedKey = createUnqualifiedName(ns, key)
        if (!states.has(unqualifiedKey)) {
            const defaultValue = (defaultValues as any)?.[key]
            states.set(unqualifiedKey, new StateBindingImpl(defaultValue))
        }
        return states.get(unqualifiedKey) as StateBindingImpl<unknown>
    }
    function createBindingProxy(ns: string | null) {
        return new Proxy({ __proto__: null } as any, {
            get(target, key) {
                if (typeof key !== 'string') throw new TypeError('Cannot have a non-string name')
                if (target[key]) return target[key]
                const unqualifiedKey = createUnqualifiedName(ns, key)
                channel.send(makeSyncRequestMessage(unqualifiedKey))
                return (target[key] = getBinding(ns, key))
            },
        })
    }
    return {
        globalBindings: createBindingProxy(null),
        createNamespacedBinding: (ns) => createBindingProxy(ns),
    }
}
class StateBindingImpl<T> implements StateBinding<T> {
    constructor(public value: T) {}
    ready = false
    version = Date.now()
    private listeners = new Set<Function>()
    resolve = () => {}
    readyPromise = new Promise<void>((r) => (this.resolve = r))
    addListener(f: Function) {
        this.listeners.add(f)
        return () => this.listeners.delete(f)
    }
    setNewValue(value: T) {
        if (isEqual(value, this.value) && this.ready) return // skip
        this.version = Date.now()
        this.ready = true
        this.value = value
        this.resolve()
        for (const f of this.listeners) {
            try {
                f()
            } catch (e) {
                console.error(e)
            }
        }
    }
}
//#region internals
function makeSyncMessage(...args: SyncMessage): InternalMessageType {
    return [InternalMessageTypeEnum.sync, ...args]
}
function makeSyncRequestMessage(...args: SyncRequestMessage): InternalMessageType {
    return [InternalMessageTypeEnum.syncRequest, ...args]
}
function isInternalMessage(x: unknown): x is InternalMessageType {
    return Array.isArray(x)
}

const enum InternalMessageTypeEnum {
    syncRequest,
    sync,
}
type SyncRequestMessage = [key: string]
type SyncMessage = [key: string, newValue: unknown]
type InternalMessageType =
    // Client => Host, host should send a sync signal
    | [type: InternalMessageTypeEnum.syncRequest, ...rest: SyncRequestMessage]
    // Host => Client, client should update local store and dispatch events if differ
    // Client => Host, update, will trigger a reverse sync again
    | [type: InternalMessageTypeEnum.sync, ...rest: SyncMessage]

/**
 * The namespace:state_name pair is encoded to the form of:
 * ":namespace;state_name"
 *
 * The global state is encoded to the form of:
 * "*;state_name"
 */
function getQualifiedName(x: string): [string | null, string] {
    const nsIndex = x.indexOf(';')
    const ns = x.slice(1, nsIndex)
    const key = x.slice(nsIndex + 1)
    return [ns === '' ? null : ns, key]
}
function createUnqualifiedName(ns: string | null, name: string) {
    return `${ns === null ? '*' : ns};${name}`
}
//#endregion
