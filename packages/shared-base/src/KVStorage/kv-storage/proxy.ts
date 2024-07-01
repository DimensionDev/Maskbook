import type { KVStorageBackend } from './types.js'

export interface ProxiedKVStorageBackend extends KVStorageBackend {
    replaceBackend(backend: KVStorageBackend): void
}

export function createProxyKVStorageBackend(): ProxiedKVStorageBackend {
    let target: KVStorageBackend
    let { promise, resolve, reject } = Promise.withResolvers<void>()

    return {
        get beforeAutoSync() {
            return promise
        },
        async getValue(...args) {
            return target!.getValue(...args)
        },
        async setValue(...args) {
            return target!.setValue(...args)
        },
        replaceBackend(backend: KVStorageBackend) {
            target = backend
            // resolve old one
            backend.beforeAutoSync.then(resolve, reject)
            // setup new one
            ;({ promise, resolve, reject } = Promise.withResolvers<void>())
            backend.beforeAutoSync.then(resolve, reject)
        },
    }
}
