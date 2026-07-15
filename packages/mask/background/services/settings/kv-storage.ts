import { indexedDB_KVStorageBackend, inMemory_KVStorageBackend } from '../../initialization/kv-storage.js'

export async function __kv_storage_write__(kind: 'indexedDB' | 'memory', key: string, value: unknown) {
    return kind === 'memory' ?
            inMemory_KVStorageBackend.setValue(key, value)
        :   indexedDB_KVStorageBackend.setValue(key, value)
}

export async function __kv_storage_read__(kind: 'indexedDB' | 'memory', key: string) {
    return kind === 'memory' ? inMemory_KVStorageBackend.getValue(key) : indexedDB_KVStorageBackend.getValue(key)
}
