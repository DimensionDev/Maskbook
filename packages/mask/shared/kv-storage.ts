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

export const ApplicationEntryUnlistedListKey = 'application_entry_unlisted_list'
export const PersistentStorages = {
    Plugin: createPersistentKVStorage('plugin', {}),
    Settings: createPersistentKVStorage('settings', {
        debugging: false,
    }),
    ApplicationEntryUnListedList: createPersistentKVStorage<{ [key: string]: boolean }>(
        ApplicationEntryUnlistedListKey,
        {
            'com.maskbook.red_packet': false,
            'com.maskbook.fileservice': false,
            'com.maskbook.ito': false,
            'com.maskbook.ito_claim': false,
            'io.mask.cross-chain-bridge': false,
            'com.maskbook.box': false,
            'com.savings': false,
            'com.maskbook.avatar': false,
            'com.maskbook.trader': false,
            'com.maskbook.transak': false,
            'com.maskbook.pets': false,
            'org.findtruman': false,
            'io.gopluslabs.security': false,
        },
    ),
}
