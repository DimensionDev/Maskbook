import { polyfill } from '@masknet/secp256k1-webcrypto'
import { setupMaskKVStorageBackend } from '../shared/kv-storage.js'
import { inMemory_KVStorageBackend, indexedDB_KVStorageBackend } from './database/kv-storage.js'

import { setupLegacySettingsAtBackground } from '../shared/legacy-settings/createSettings.js'
import { __deprecated__getStorage, __deprecated__setStorage } from './utils/deprecated-storage.js'

import './services/setup.js'
import './tasks/setup.js' // Setup Tasks
import '../shared/site-adaptors/index.js'
import '../shared/native-rpc/index.js' // setup Android and iOS API server

polyfill()
setupMaskKVStorageBackend(indexedDB_KVStorageBackend, inMemory_KVStorageBackend)
setupLegacySettingsAtBackground(__deprecated__getStorage, __deprecated__setStorage)
