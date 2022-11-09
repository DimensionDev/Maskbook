import { polyfill } from '@masknet/secp256k1-webcrypto'
import { setupMaskKVStorageBackend } from '../shared/kv-storage.js'
import { inMemory_KVStorageBackend, indexedDB_KVStorageBackend } from './database/kv-storage.js'

import { setupLegacySettingsAtBackground } from '../shared/legacy-settings/createSettings.js'
import { __deprecated__getStorage, __deprecated__setStorage } from './utils/deprecated-storage.js'

import './services/setup.js'
import './tasks/setup.js' // Setup Tasks
import '../shared/site-adaptors/index.js'
import '../shared/native-rpc/index.js' // setup Android and iOS API server

if (process.env.architecture === 'app') {
    // Note: mobile (Android and iOS does not return a correct MINE type, therefore we can not use streaming to initialize the WASM module).
    WebAssembly.instantiateStreaming = undefined!
    WebAssembly.compileStreaming = undefined!
}

polyfill()
setupMaskKVStorageBackend(indexedDB_KVStorageBackend, inMemory_KVStorageBackend)
setupLegacySettingsAtBackground(__deprecated__getStorage, __deprecated__setStorage)
