import type { UnboundedRegistry as MessageChannel } from '@dimensiondev/holoflows-kit'
import type { Subscription } from 'use-subscription'

export { createInMemoryKVStorageBackend } from './in-memory'
export { createIndexedDB_KVStorageBackend } from './idb'
export const removed = Symbol.for('removed')
export interface KVStorageBackend {
    setValue(key: string, value: any): Promise<void>
    getValue(key: string): Promise<any>
    beforeAutoSync: Promise<void>
}

/**
 * Create a root scope of simple K/V storage.
 * @param backend The storage provider
 * @param message The message channel to sync the latest value
 * @param signal The abort signal
 */
export function createKVStorage(
    backend: KVStorageBackend,
    message: MessageChannel<any>,
    signal?: AbortSignal,
): StateScope<never>['createSubscope'] {
    return (name, defaultValues) => {
        return createScope(signal, backend, message, null, name, defaultValues)
    }
}

export interface StateScope<StorageState extends object> {
    createSubscope<StorageState extends object>(
        subScopeName: string,
        defaultValue: StorageState,
    ): StateScope<StorageState>
    storage: StateObject<StorageState>
}
export type StateObject<T extends object> = {
    [key in keyof T]: State<T[key]>
}
export interface State<T> {
    /** If this state is initialized */
    get initialized(): boolean
    /** A promise of initialization of this state. */
    readonly initializedPromise: Promise<void>
    get state(): T
    readonly subscription: Subscription<T>
    setState(value: T): Promise<void>
}
const alwaysThrowHandler = () => {
    throw new TypeError('Invalid operation')
}
function createScope(
    signal: AbortSignal | undefined,
    backend: KVStorageBackend,
    message: MessageChannel<any>,
    parentScope: string | null,
    scope: string,
    defaultValues: any,
): StateScope<any> {
    if (scope.includes('/')) throw new TypeError('scope name cannot contains "/"')
    if (scope.includes(':')) throw new TypeError('scope name cannot contains ":"')
    const currentScope = `${parentScope}/${scope}`
    const storage: StateObject<any> = new Proxy({ __proto__: null } as any, {
        defineProperty: alwaysThrowHandler,
        deleteProperty: alwaysThrowHandler,
        set: alwaysThrowHandler,
        preventExtensions: alwaysThrowHandler,
        setPrototypeOf: alwaysThrowHandler,
        get(target, prop, receiver) {
            if (typeof prop === 'symbol') return undefined
            if (target[prop]) return target[prop]
            target[prop] = createState(signal, backend, message, currentScope, prop, defaultValues[prop])
            return target[prop]
        },
    })

    backend.beforeAutoSync.then(() => {
        for (const [key, value] of Object.entries(defaultValues)) {
            if (value === removed) continue
            // trigger the auto sync
            storage[key].initialized
        }
    })

    return {
        createSubscope(subscope, defaultValues) {
            return createScope(signal, backend, message, currentScope, subscope, defaultValues)
        },
        storage,
    }
}

function createState(
    signal: AbortSignal | undefined,
    backend: KVStorageBackend,
    message: MessageChannel<any>,
    scope: string,
    prop: string,
    defaultValue: any,
): State<any> {
    const propKey = `${scope}:${prop}`

    let initialized = false
    const initializedPromise: Promise<void> = backend.beforeAutoSync
        .then(() => backend.getValue(propKey))
        .then((val) => {
            state = val
            initialized = true
        })
    let state = defaultValue

    const listeners = new Set<Function>()
    function subscribe(f: Function) {
        listeners.add(f)
        return () => listeners.delete(f)
    }
    const subscription: Subscription<any> = {
        getCurrentValue: () => {
            if (!initialized) throw initializedPromise
            return state
        },
        subscribe,
    }

    function setter(val: any) {
        if (isEqual(state, val)) return
        state = val
        for (const f of listeners) f()
    }

    message.on(([eventKey, newValue]) => eventKey === propKey && setter(newValue), { signal })

    return {
        get initialized() {
            return initialized
        },
        get initializedPromise() {
            return initializedPromise!
        },
        get state() {
            return state
        },
        async setState(value) {
            if (signal?.aborted) throw new TypeError('Invalid state.')
            if (!isEqual(state, value)) await backend.setValue(propKey, value)
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
