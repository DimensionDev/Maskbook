import { MaskMessages } from '../Messages/index.js'
import { createKVStorageHost, createProxyKVStorageBackend, type KVStorageBackend } from './kv-storage/index.js'

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
    googleToken: string | null
    googleAccount: string | null
}

interface FireflyAccount {
    accessToken: string
    accountId: string
    avatar: string
    /** @example '2023-07-30T06:57:39.418Z' */
    createdAt: string
    displayName: string
    isNew: boolean
    uid: string
}

export const PersistentStorages = {
    Plugin: createPersistentKVStorage('plugin', {}),
    Web3: createPersistentKVStorage('web3', {}),
    Settings: createPersistentKVStorage<{
        debugging: boolean
        /** @deprecated use lastLensAccount instead */
        latestLensProfile: string
        /** lens account address, distinct by wallet address */
        lastLensAccountMap: Record<string, string>
        backupConfig: BackupConfig
        firefly_account: FireflyAccount
    }>('settings@v1', {
        debugging: false,
        latestLensProfile: '',
        lastLensAccountMap: {},
        backupConfig: {
            backupPassword: '',
            email: '',
            phone: '',
            localBackupAt: '',
            cloudBackupAt: '',
            cloudBackupMethod: null,
            googleToken: '',
            googleAccount: '',
        },
        firefly_account: {
            accessToken: '',
            accountId: '',
            avatar: '',
            createdAt: '',
            displayName: '',
            isNew: false,
            uid: '',
        },
    }),
    ApplicationEntryUnListed: createPersistentKVStorage<{ data: string[] }>(APPLICATION_ENTRY_UNLISTED, { data: [] }),
}
