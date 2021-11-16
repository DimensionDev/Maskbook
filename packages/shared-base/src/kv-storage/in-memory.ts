import type { KVStorageBackend } from '.'
import { Some, None } from 'ts-results'
export function createInMemoryKVStorageBackend(
    onChange: (key: string, value: unknown) => void,
    beforeAutoSync = Promise.resolve(),
): KVStorageBackend {
    const storage = new Map<string, any>()
    return {
        beforeAutoSync,
        async getValue(key) {
            console.log(storage)
            if (storage.has(key)) return Some(storage.get(key))
            return None
        },
        async setValue(key, value) {
            storage.set(key, value)
            onChange(key, value)
            console.log(storage)
        },
    }
}
