import { setupMaskKVStorageBackend } from '../shared/kv-storage'
import { inMemory_KVStorageBackend, indexedDB_KVStorageBackend } from './database/kv-storage'

setupMaskKVStorageBackend(indexedDB_KVStorageBackend, inMemory_KVStorageBackend)
