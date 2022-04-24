import { createProxyKVStorageBackend, createKVStorageHost, KVStorageBackend } from '@masknet/shared-base'
import { PluginId } from '@masknet/plugin-infra'
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

const ApplicationEntryUnlistedListKey = 'application_entry_unlisted_list'
export const PersistentStorages = {
    Plugin: createPersistentKVStorage('plugin', {}),
    Settings: createPersistentKVStorage('settings', {
        debugging: false,
    }),
    ApplicationEntryUnListedList: createPersistentKVStorage<{ [key: string]: boolean }>(
        ApplicationEntryUnlistedListKey,
        {
            [PluginId.RedPacket]: false,
            [PluginId.FileService]: false,
            [PluginId.ITO]: false,
            [`${PluginId.ITO}_claim`]: false,
            [PluginId.CrossChainBridge]: false,
            [PluginId.MaskBox]: false,
            [PluginId.Savings]: false,
            [PluginId.Avatar]: false,
            [PluginId.Trader]: false,
            [PluginId.Tips]: false,
            [PluginId.Transak]: false,
            [PluginId.Pets]: false,
            [PluginId.FindTruman]: false,
            [PluginId.GoPlusSecurity]: false,
        },
    ),
}
