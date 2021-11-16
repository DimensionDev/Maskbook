import { createProxyKVStorageBackend, createKVStorageHost, KVStorageBackend } from '@masknet/shared-base'
import { MaskMessages } from './messages'

const indexedDBProxy = createProxyKVStorageBackend()
const inMemoryBackend = createProxyKVStorageBackend()
export function setupMaskKVStorageBackend(indexedDB: KVStorageBackend, inMemory: KVStorageBackend) {
    indexedDBProxy.replaceBackend(indexedDB)
    inMemoryBackend.replaceBackend(inMemory)
}
export const createPersistentKVStorage = createKVStorageHost(
    indexedDBProxy,
    MaskMessages.events.__kv_backend_presistent__,
)
export const createInMemoryKVStorage = createKVStorageHost(
    inMemoryBackend,
    MaskMessages.events.__kv_backend_in_memory__,
)

Object.assign(globalThis, { createPersistentKVStorage, createInMemoryKVStorage })
