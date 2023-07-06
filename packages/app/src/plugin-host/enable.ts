import './register.js'

import { Emitter } from '@servie/events'
import { CurrentSNSNetwork, startPluginSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { BooleanPreference, createI18NBundle, createKVStorageHost, i18NextInstance } from '@masknet/shared-base'
import { setupReactShadowRootEnvironment } from '@masknet/theme'
import { addListener } from './message.js'
import { PluginWorker } from './rpc.js'
import { createSharedContext } from '../helpers/createSharedContext.js'

// #region Setup storage
const inMemoryStorage = createKVStorageHost(
    {
        beforeAutoSync: Promise.resolve(),
        getValue: PluginWorker.memoryRead,
        setValue: PluginWorker.memoryWrite,
    },
    {
        on: (callback) => addListener('inMemoryStorage', callback),
    },
)
const indexedDBStorage = createKVStorageHost(
    {
        beforeAutoSync: Promise.resolve(),
        getValue: PluginWorker.indexedDBRead,
        setValue: PluginWorker.indexedDBWrite,
    },
    {
        on: (callback) => addListener('indexedDBStorage', callback),
    },
)
// #endregion

startPluginSNSAdaptor(CurrentSNSNetwork.__SPA__, {
    minimalMode: {
        events: new Emitter(),
        isEnabled: () => BooleanPreference.True,
    },
    addI18NResource(plugin, resource) {
        createI18NBundle(plugin, resource)(i18NextInstance)
    },
    createContext(id, signal) {
        return {
            createKVStorage(type, defaultValues) {
                if (type === 'memory') return inMemoryStorage(id, defaultValues, signal)
                else return indexedDBStorage(id, defaultValues, signal)
            },
            ...createSharedContext(),
        }
    },
    permission: {
        hasPermission: async () => false,
        events: new Emitter(),
    },
})

setupReactShadowRootEnvironment({ mode: 'open' }, [])
