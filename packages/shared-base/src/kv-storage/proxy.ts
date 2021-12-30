import type { KVStorageBackend } from './types'
import { defer } from '../utils/defer'

export interface ProxiedKVStorageBackend extends KVStorageBackend {
    replaceBackend(backend: KVStorageBackend): void
}

export function createProxyKVStorageBackend(): ProxiedKVStorageBackend {
    let target: KVStorageBackend
    let [promise, resolve, reject] = defer<void>()

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
            ;[promise, resolve, reject] = defer()
            backend.beforeAutoSync.then(resolve, reject)
        },
    }
}
