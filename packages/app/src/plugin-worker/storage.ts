import './register.js'
import { createIndexedDB_KVStorageBackend, createInMemoryKVStorageBackend } from '@masknet/shared-base'
import { broadcastMessage } from './message-port.js'

export const inMemoryStorageBackend = createInMemoryKVStorageBackend((key, value) => {
    broadcastMessage('inMemoryStorage', [key, value])
})
export const indexedDBStorageBackend = createIndexedDB_KVStorageBackend('mask-plugin', (key, value) => {
    broadcastMessage('indexedDBStorage', [key, value])
})
