import { setupMaskKVStorageBackend } from '@masknet/shared'
import { inMemory_KVStorageBackend, indexedDB_KVStorageBackend } from './database/kv-storage'

export const serviceSetup = () => setupMaskKVStorageBackend(indexedDB_KVStorageBackend, inMemory_KVStorageBackend)
