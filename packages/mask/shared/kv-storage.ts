import { createProxyKVStorageBackend, createKVStorage, createInMemoryKVStorageBackend } from '@masknet/shared-base'
import { MaskMessages } from './messages'

const provideKVStorageBackend = createProxyKVStorageBackend()
export const { replaceBackend: setupMaskKVStorageBackend } = provideKVStorageBackend
export const createPersistentKVStorage = createKVStorage(
    provideKVStorageBackend,
    MaskMessages.events.__kv_backend_presistent__,
)
export const createInMemoryKVStorage = createKVStorage(
    createInMemoryKVStorageBackend(),
    MaskMessages.events.__kv_backend_in_memory__,
)

Object.assign(globalThis, { createPersistentKVStorage, createInMemoryKVStorage })
