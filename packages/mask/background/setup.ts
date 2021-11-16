import { createIndexedDB_KVStorageBackend } from '@masknet/shared-base'
import { setupMaskKVStorageBackend } from '../shared/kv-storage'

setupMaskKVStorageBackend(createIndexedDB_KVStorageBackend('mask-kv'))
