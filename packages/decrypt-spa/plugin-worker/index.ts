import './register.js'
import { BooleanPreference, startPluginWorker, type Plugin } from '@masknet/plugin-infra/background-worker'
import { Emitter } from '@servie/events'
import {
    createI18NBundle,
    createIndexedDB_KVStorageBackend,
    createInMemoryKVStorageBackend,
    createKVStorageHost,
    i18NextInstance,
} from '@masknet/shared-base'
import { createPluginDatabase } from './database/database.js'
import { addListener, broadcastMessage } from './message.js'

// TODO: broadcast should exclude the sender
const inMemoryStorage = createKVStorageHost(
    createInMemoryKVStorageBackend((key, value) => {
        broadcastMessage('inMemoryStorage', [key, value])
    }),
    {
        on: (callback) =>
            addListener('inMemoryStorage', (message: any) => {
                callback(message)
            }),
    },
)
const indexedDBStorage = createKVStorageHost(
    createIndexedDB_KVStorageBackend('mask-plugin', (key, value) => {
        broadcastMessage('indexedDBStorage', [key, value])
    }),
    {
        on: (callback) =>
            addListener('indexedDBStorage', (message: any) => {
                callback(message)
            }),
    },
)
startPluginWorker({
    addI18NResource(pluginID, resources) {
        createI18NBundle(pluginID, resources)(i18NextInstance)
    },
    createContext(pluginID, signal) {
        let storage: Plugin.Worker.DatabaseStorage<any> = undefined!
        const context: Plugin.Worker.WorkerContext = {
            createKVStorage(type, defaultValues) {
                if (type === 'memory') return inMemoryStorage(pluginID, defaultValues, signal)
                else return indexedDBStorage(pluginID, defaultValues, signal)
            },
            createLogger() {
                // TODO:
                return undefined
            },
            getDatabaseStorage() {
                return storage || (storage = createPluginDatabase(pluginID, signal))
            },
        }
        return context
    },
    minimalMode: {
        events: new Emitter(),
        isEnabled(id) {
            return BooleanPreference.False
        },
    },
    // impossible to support this
    permission: {
        events: new Emitter(),
        hasPermission: async () => false,
    },
})
