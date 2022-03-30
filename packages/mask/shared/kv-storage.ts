import { createProxyKVStorageBackend, createKVStorageHost, KVStorageBackend } from '@masknet/shared-base'
import { MaskMessages } from './messages'

const indexedDBProxy = createProxyKVStorageBackend()
const inMemoryBackend = createProxyKVStorageBackend()
export function setupMaskKVStorageBackend(indexedDB: KVStorageBackend, inMemory: KVStorageBackend) {
    indexedDBProxy.replaceBackend(indexedDB)
    inMemoryBackend.replaceBackend(inMemory)
}
const createPersistentKVStorage = createKVStorageHost(indexedDBProxy, MaskMessages.events.__kv_backend_persistent__)
const createInMemoryKVStorage = createKVStorageHost(inMemoryBackend, MaskMessages.events.__kv_backend_in_memory__)

export const InMemoryStorages = {
    Plugin: createInMemoryKVStorage('plugin', {}),
    FacebookNFTEventOnMobile: createInMemoryKVStorage('FacebookNFTEventOnMobile', {
        userId: '',
        avatarId: '',
        address: '',
        tokenId: '',
    }),
}
export const PersistentStorages = {
    Plugin: createPersistentKVStorage('plugin', {}),
}
