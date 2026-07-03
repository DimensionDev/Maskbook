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
    /**
     * @deprecated Legacy v1 bearer token. Kept for backward compat with sessions
     * created before the JWT v3 rollout. Prefer `access_token_v3` when present.
     */
    accessToken: string
    accountId: string
    avatar: string
    /** @example '2023-07-30T06:57:39.418Z' */
    createdAt: string
    displayName: string
    isNew: boolean
    uid: string
    /** Firefly JWT v3 access token (short TTL). Preferred over `accessToken`. */
    access_token_v3?: string
    /** Firefly JWT v3 refresh token (longer TTL, rotated on each use). */
    refresh_token_v3?: string
    /** Session ID for client-side tracking. Not used in auth headers. */
    session_id?: string
}

/**
 * Extract the active Firefly access token from a stored account value.
 *
 * Mirrors Firefly's own read order (`jwt.accessToken ?? legacyToken`): prefer the
 * JWT v3 token (`access_token_v3`) and fall back to the legacy `accessToken` so
 * sessions created before and after the v3 rollout both authenticate. Null-safe —
 * returns `undefined` for missing/malformed values instead of throwing, so a
 * partially-stored or legacy `firefly_account` can't crash consumers.
 */
export function getFireflyAccessToken(account?: FireflyAccount | null): string | undefined {
    if (!account) return undefined
    return account.access_token_v3 || account.accessToken || undefined
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
