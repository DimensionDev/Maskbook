import { createProxyKVStorageBackend, createKVStorageHost, type KVStorageBackend, PluginID } from '@masknet/shared-base'
import { MaskMessages } from './messages.js'

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
    FacebookNFTEventOnMobile: createInMemoryKVStorage('FacebookNFTEventMobile', {
        userId: '',
        avatarId: '',
        address: '',
        tokenId: '',
        schema: 1,
        chainId: 1,
        pluginID: '',
    }),
}

const ApplicationEntryUnlistedListKey = 'application_entry_unlisted_list'
const APPLICATION_ENTRY_UNLISTED = 'APPLICATION_ENTRY_UNLISTED'
export const PersistentStorages = {
    Plugin: createPersistentKVStorage('plugin', {}),
    Settings: createPersistentKVStorage('settings', {
        debugging: false,
    }),
    /** @deprecated */
    ApplicationEntryUnListedList: createPersistentKVStorage<{
        current: {
            [key: string]: boolean
        }
    }>(ApplicationEntryUnlistedListKey, {
        current: {
            [PluginID.RedPacket]: false,
            [PluginID.FileService]: false,
            [PluginID.ITO]: false,
            [`${PluginID.ITO}_claim`]: false,
            [PluginID.CrossChainBridge]: false,
            [PluginID.MaskBox]: false,
            [PluginID.Savings]: false,
            [PluginID.Avatar]: false,
            [PluginID.Trader]: false,
            [PluginID.Tips]: false,
            [PluginID.Transak]: false,
            [PluginID.Pets]: false,
            [PluginID.GoPlusSecurity]: false,
        },
    }),
    ApplicationEntryUnListed: createPersistentKVStorage<{ list: string[] }>(APPLICATION_ENTRY_UNLISTED, { list: [] }),
}
