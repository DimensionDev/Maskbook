import { polyfill } from '@masknet/secp256k1-webcrypto'
import { setupLegacySettingsAtBackground, setupMaskKVStorageBackend } from '@masknet/shared-base'
import { inMemory_KVStorageBackend, indexedDB_KVStorageBackend } from './database/kv-storage.js'

import { __deprecated__getStorage, __deprecated__setStorage } from './utils/deprecated-storage.js'

polyfill()
setupMaskKVStorageBackend(indexedDB_KVStorageBackend, inMemory_KVStorageBackend)
setupLegacySettingsAtBackground(__deprecated__getStorage, __deprecated__setStorage)
