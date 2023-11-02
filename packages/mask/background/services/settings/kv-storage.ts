import { indexedDB_KVStorageBackend, inMemory_KVStorageBackend } from '../../initialization/kv-storage.js'

export async function __kv_storage_write__(kind: 'indexedDB' | 'memory', key: string, value: unknown) {
    if (kind === 'memory') {
        return inMemory_KVStorageBackend.setValue(key, value)
    } else {
        return indexedDB_KVStorageBackend.setValue(key, value)
    }
}

export async function __kv_storage_read__(kind: 'indexedDB' | 'memory', key: string) {
    if (kind === 'memory') {
        return inMemory_KVStorageBackend.getValue(key)
    } else {
        return indexedDB_KVStorageBackend.getValue(key)
    }
}
