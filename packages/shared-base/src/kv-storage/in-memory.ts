import type { KVStorageBackend } from '.'

export function createInMemoryKVStorageBackend(beforeAutoSync = Promise.resolve()): KVStorageBackend {
    const storage = new Map<string, any>()
    return {
        beforeAutoSync,
        async getValue(key) {
            return storage.get(key)
        },
        async setValue(key, value) {
            storage.set(key, value)
        },
    }
}
