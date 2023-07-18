import { broadcastMessage } from './message-port.js'
import './register.js'
import {
    createIndexedDB_KVStorageBackend,
    createInMemoryKVStorageBackend,
    setupMaskKVStorageBackend,
} from '@masknet/shared-base'

export const inMemoryStorageBackend = createInMemoryKVStorageBackend((key, value) => {
    broadcastMessage('inMemoryStorage', [key, value])
})
export const indexedDBStorageBackend = createIndexedDB_KVStorageBackend('mask-plugin', (key, value) => {
    broadcastMessage('indexedDBStorage', [key, value])
})
setupMaskKVStorageBackend(indexedDBStorageBackend, inMemoryStorageBackend)
