import type { KVStorageBackend } from '@masknet/shared-base'
import { setupMaskKVStorageBackend } from '../shared/kv-storage.js'
import Services from './extension/service.js'
import { contentFetch } from './utils/fetcher.js'

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

// Temporary, will be removed when the Mask SDK is ready
Reflect.set(globalThis, 'r2d2Fetch', (req: RequestInfo, init?: RequestInit) => {
    const signal = init?.signal
    if (init) delete init.signal
    return Services.Helper.r2d2Fetch(req, init).then((response) => {
        signal?.throwIfAborted()
        return response
    })
})
Reflect.set(globalThis, 'fetch', contentFetch)
