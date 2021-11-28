import { createKVStorageHost, KVStorageBackend } from '@masknet/shared-base'
import { Services, Messages } from '../API'

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
const createPersistentKVStorage = createKVStorageHost(indexedDB, Messages.events.__kv_backend_persistent__)
const createInMemoryKVStorage = createKVStorageHost(memory, Messages.events.__kv_backend_in_memory__)

export const InMemoryStorages = {
    Plugin: createInMemoryKVStorage('plugin', {}),
}
export const PersistentStorages = {
    Plugin: createPersistentKVStorage('plugin', {}),
}
