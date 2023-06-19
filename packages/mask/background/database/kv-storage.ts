import { createIndexedDB_KVStorageBackend, createInMemoryKVStorageBackend, MaskMessages } from '@masknet/shared-base'

export const indexedDB_KVStorageBackend = createIndexedDB_KVStorageBackend('mask-kv', (k, v) =>
    MaskMessages.events.__kv_backend_persistent__.sendByBroadcast([k, v]),
)
export const inMemory_KVStorageBackend = createInMemoryKVStorageBackend((k, v) =>
    MaskMessages.events.__kv_backend_in_memory__.sendByBroadcast([k, v]),
)
