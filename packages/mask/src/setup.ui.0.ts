import type { KVStorageBackend } from '@masknet/shared-base'
import { setupMaskKVStorageBackend } from '../shared/kv-storage'
import Services from './extension/service'

const memory: KVStorageBackend = {
    beforeAutoSync: Promise.resolve(),
    getValue(...args) {
        return Services.Settings.__kv_storage_read__('memory', ...args)
    },
    async setValue(...args) {
        await Services.Settings.__kv_storage_write__('memory', ...args)
    },
}
const indexedDB: KVStorageBackend = {
    beforeAutoSync: Promise.resolve(),
    getValue(...args) {
        return Services.Settings.__kv_storage_read__('indexedDB', ...args)
    },
    async setValue(...args) {
        await Services.Settings.__kv_storage_write__('indexedDB', ...args)
    },
}
setupMaskKVStorageBackend(indexedDB, memory)
