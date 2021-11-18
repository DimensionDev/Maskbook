import type { KVStorageBackend } from '.'

export interface ProxiedKVStorageBackend extends KVStorageBackend {
    replaceBackend(backend: KVStorageBackend): void
}

export function createProxyKVStorageBackend(): ProxiedKVStorageBackend {
    let target: KVStorageBackend

    return {
        get beforeAutoSync() {
            return target!.beforeAutoSync
        },
        async getValue(...args) {
            return target!.getValue(...args)
        },
        async setValue(...args) {
            return target!.setValue(...args)
        },
        replaceBackend(backend: KVStorageBackend) {
            target = backend
        },
    }
}
