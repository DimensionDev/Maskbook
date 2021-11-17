import { createIndexedDB_KVStorageBackend, createInMemoryKVStorageBackend } from '@masknet/shared-base'
import { MaskMessages } from '../../shared'

export const indexedDB_KVStorageBackend = createIndexedDB_KVStorageBackend('mask-kv', (k, v) =>
    MaskMessages.events.__kv_backend_persistent__.sendByBroadcast([k, v]),
)
export const inMemory_KVStorageBackend = createInMemoryKVStorageBackend((k, v) =>
    MaskMessages.events.__kv_backend_in_memory__.sendByBroadcast([k, v]),
)
