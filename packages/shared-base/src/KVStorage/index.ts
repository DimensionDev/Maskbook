import { MaskMessages } from '../Messages/index.js'
import { createProxyKVStorageBackend, type KVStorageBackend, createKVStorageHost } from './kv-storage/index.js'

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
    Web3: createInMemoryKVStorage('web3', {}),
}

/**
 * @deprecated Will be removed in 2.23
 */
const ApplicationEntryUnlistedListKey = 'application_entry_unlisted_list'
const APPLICATION_ENTRY_UNLISTED = 'APPLICATION_ENTRY_UNLISTED'

export enum BackupAccountType {
    Email = 'email',
    Phone = 'phone',
}
export interface BackupConfig {
    backupPassword: string | null
    email: string | null
    phone: string | null
    localBackupAt: string | null
    cloudBackupAt: string | null
    cloudBackupMethod: BackupAccountType | null
}

export const PersistentStorages = {
    Plugin: createPersistentKVStorage('plugin', {}),
    Web3: createPersistentKVStorage('web3', {}),
    Settings: createPersistentKVStorage<{
        debugging: boolean
        latestLensProfile: string
        backupConfig: BackupConfig
    }>('settings', {
        debugging: false,
        latestLensProfile: '',
        backupConfig: {
            backupPassword: '',
            email: '',
            phone: '',
            localBackupAt: '',
            cloudBackupAt: '',
            cloudBackupMethod: null,
        },
    }),
    /**
     * @deprecated Will be removed in 2.23
     */
    ApplicationEntryUnListedList: createPersistentKVStorage<{
        current: {
            [key: string]: boolean
        }
    }>(ApplicationEntryUnlistedListKey, {
        current: {},
    }),
    ApplicationEntryUnListed: createPersistentKVStorage<{ data: string[] }>(APPLICATION_ENTRY_UNLISTED, { data: [] }),
}

// TODO remove in 2.23
async function migrateUnlistedEntries() {
    await Promise.allSettled([
        PersistentStorages.ApplicationEntryUnListedList.storage.current.initializedPromise,
        PersistentStorages.ApplicationEntryUnListed.storage.data.initializedPromise,
    ])
    const legacyData = PersistentStorages.ApplicationEntryUnListedList.storage.current.value
    const newData = PersistentStorages.ApplicationEntryUnListed.storage.data.value
    const pairs = Array.from(Object.entries(legacyData))
    const unlisted = pairs.filter((x) => x[1])
    if (unlisted.length && !newData.length) {
        const legacyList = unlisted.map((x) => x[0])
        await PersistentStorages.ApplicationEntryUnListed.storage.data.setValue(legacyList)
        await PersistentStorages.ApplicationEntryUnListedList.storage.current.setValue({})
    }
}
migrateUnlistedEntries()
