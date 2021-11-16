import type { KVStorageBackend } from '.'
import { Some, None } from 'ts-results'
export function createInMemoryKVStorageBackend(beforeAutoSync = Promise.resolve()): KVStorageBackend {
    const storage = new Map<string, any>()
    return {
        beforeAutoSync,
        async getValue(key) {
            console.log(storage)
            if (storage.has(key)) return Some(storage.get(key))
            return None
        },
        async setValue(key, value) {
            console.log(storage)
            storage.set(key, value)
        },
    }
}
