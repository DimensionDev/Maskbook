import { polyfill } from '@dimensiondev/secp256k1-webcrypto'
import { setupMaskKVStorageBackend } from '../shared/kv-storage'
import { inMemory_KVStorageBackend, indexedDB_KVStorageBackend } from './database/kv-storage'

import { setupLegacySettingsAtBackground } from '../shared/legacy-settings/createSettings'
import { __deprecated__getStorage, __deprecated__setStorage } from './utils/deprecated-storage'

import '../shared/site-adaptors'

polyfill()
setupMaskKVStorageBackend(indexedDB_KVStorageBackend, inMemory_KVStorageBackend)
setupLegacySettingsAtBackground(__deprecated__getStorage, __deprecated__setStorage)
