import type { KVStorageBackend } from './types.js'
import { Some, None } from 'ts-results-es'

/**
 * Create a KVStorageBackend that stores the data in the memory
 * @param onChange When the database receives a change. onChange should broadcast this to all clients.
 * @param beforeAutoSync The promise to wait before the auto-sync starts.
 * @returns A KVStorageBackend
 */
export function createInMemoryKVStorageBackend(
    onChange: (key: string, value: unknown) => void,
    beforeAutoSync = Promise.resolve(),
): KVStorageBackend {
    const storage = new Map<string, any>()
    return {
        beforeAutoSync,
        async getValue(key) {
            if (storage.has(key)) return Some(storage.get(key))
            return None
        },
        async setValue(key, value) {
            storage.set(key, value)
            onChange(key, value)
        },
    }
}
