import { combineAbortSignal } from '@masknet/kit'
import type { Subscription } from 'use-subscription'
import type { KVStorageBackend } from './types.js'

export { createInMemoryKVStorageBackend } from './in-memory.js'
export { createIndexedDB_KVStorageBackend } from './idb.js'
export { createProxyKVStorageBackend } from './proxy.js'
export type { ProxiedKVStorageBackend } from './proxy.js'

export const removed = Symbol.for('removed')
export type * from './types.js'

/**
 * Create a root scope of simple K/V storage.
 * @param backend The storage provider
 * @param message The message channel to sync the latest value
 * @param signal The abort signal
 */
export function createKVStorageHost(
    backend: KVStorageBackend,
    message: {
        on(callback: (data: [string, unknown]) => void, options?: AddEventListenerOptions): () => void
    },
    signal = new AbortController().signal,
): ScopedStorage<never>['createSubScope'] {
    return (name, defaultValues) => {
        return createScope(signal, backend, message, null, name, defaultValues)
    }
}

export interface ScopedStorage<StorageState extends object> {
    createSubScope<StorageState extends object>(
        subScopeName: string,
        defaultValue: StorageState,
        signal?: AbortSignal,
    ): ScopedStorage<StorageState>
    storage: StorageObject<StorageState>
}
export type StorageObject<T extends object> = {
    [key in keyof T]: StorageItem<T[key]>
}
export interface StorageItem<T> {
    /** If this state is initialized */
    get initialized(): boolean
    /** A promise of initialization of this state. */
    readonly initializedPromise: Promise<void>
    get value(): T
    readonly subscription: Subscription<T>
    setValue(value: T): Promise<void>
}
const alwaysThrowHandler = () => {
    throw new TypeError('Invalid operation')
}
function createScope(
    signal: AbortSignal,
    backend: KVStorageBackend,
    message: {
        on(callback: (data: any) => void, options?: AddEventListenerOptions): () => void
    },
    parentScope: string | null,
    scope: string,
    defaultValues: any,
): ScopedStorage<any> {
    if (scope.includes('/')) throw new TypeError('scope name cannot contains "/"')
    if (scope.includes(':')) throw new TypeError('scope name cannot contains ":"')
    const currentScope = parentScope === null ? scope : `${parentScope}/${scope}`
    const storage_inner: StorageObject<any> = {
        __proto__: new Proxy({ __proto__: null } as any, { get: (_, prop) => get(prop) }),
    }
    const storage = new Proxy(storage_inner, {
        defineProperty: alwaysThrowHandler,
        deleteProperty: alwaysThrowHandler,
        getPrototypeOf: () => null,
        setPrototypeOf: (_, v) => v === null,
        getOwnPropertyDescriptor: (_, p) => {
            get(p)
            return Reflect.getOwnPropertyDescriptor(storage_inner, p)
        },
    })
    function get(key: string | symbol) {
        if (typeof key === 'symbol') return undefined
        const value = createState(signal, backend, message, currentScope, key, defaultValues[key])
        Object.defineProperty(storage_inner, key, { enumerable: true, value })
        return value
    }

    backend.beforeAutoSync.then(() => {
        for (const [key, value] of Object.entries(defaultValues)) {
            if (value === removed) continue
            // trigger the auto sync
            storage[key].initialized
        }
    })

    return {
        createSubScope(subScope, defaultValues, scopeSignal) {
            const aggregatedSignal = combineAbortSignal(scopeSignal, signal)
            return createScope(aggregatedSignal, backend, message, currentScope, subScope, defaultValues)
        },
        storage,
    }
}

function createState(
    signal: AbortSignal,
    backend: KVStorageBackend,
    message: {
        on(callback: (data: any) => void, options?: AddEventListenerOptions): () => void
    },
    scope: string,
    prop: string,
    defaultValue: any,
): StorageItem<any> {
    const propKey = `${scope}:${prop}`

    let initialized = false
    let usingDefaultValue = true
    const initializedPromise: Promise<void> = backend.beforeAutoSync
        .then(() => backend.getValue(propKey))
        .then((val) => {
            if (val.isSome()) usingDefaultValue = false
            return val.unwrapOr(defaultValue)
        })
        .then((val) => {
            state = val
            initialized = true
        })
    let state = defaultValue

    const listeners = new Set<() => void>()
    function subscribe(f: () => void) {
        listeners.add(f)
        return () => listeners.delete(f)
    }
    const subscription: Subscription<any> = {
        getCurrentValue: () => {
            // TODO: suspense
            if (!initialized) throw initializedPromise
            return state
        },
        subscribe,
    }

    function setter(val: any) {
        if (isEqual(state, val)) return
        usingDefaultValue = false
        state = val
        for (const f of listeners) f()
    }

    message.on(([eventKey, newValue]) => eventKey === propKey && setter(newValue), { signal })

    return {
        get initialized() {
            return initialized
        },
        get initializedPromise() {
            return initializedPromise
        },
        get value() {
            if (!initialized) throw new Error(`Try to access K/V state before initialization finished: ${propKey}.`)
            return state
        },
        async setValue(value) {
            if (signal.aborted) throw new TypeError('Aborted storage.')
            // force trigger store when set state with default value to make it persistent.
            if (usingDefaultValue || !isEqual(state, value)) await backend.setValue(propKey, value)
            setter(value)
        },
        subscription,
    }
}
function isEqual(a: any, b: any) {
    if (a === b) return true
    if (a === null || b === null) return false
    if (typeof a === 'object') {
        // Note: JSON stringify is not stable.
        return JSON.stringify(a) === JSON.stringify(b)
    }
    return false
}
