import './register.js'

import { noop } from 'lodash-es'
import { startPluginWorker, type Plugin } from '@masknet/plugin-infra/background-worker'
import { Emitter } from '@servie/events'
import { BooleanPreference, createI18NBundle, createKVStorageHost, i18NextInstance } from '@masknet/shared-base'
import { createPluginDatabase } from './database/database.js'
import { indexedDBStorageBackend, inMemoryStorageBackend } from './storage.js'
import { setPluginWorkerReady } from './ready.js'

const inMemoryStorage = createKVStorageHost(inMemoryStorageBackend, {
    on: () => noop,
})
const indexedDBStorage = createKVStorageHost(indexedDBStorageBackend, {
    on: () => noop,
})
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

// TODO: add a callback in startPluginWorker instead of timeout
setTimeout(() => setPluginWorkerReady(), 200)
