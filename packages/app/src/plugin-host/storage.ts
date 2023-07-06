import { createKVStorageHost } from '@masknet/shared-base'
import { addListener } from './message.js'
import { PluginWorker } from './rpc.js'

// #region Setup storage
export const inMemoryStorage = createKVStorageHost(
    {
        beforeAutoSync: Promise.resolve(),
        getValue: PluginWorker.memoryRead,
        setValue: PluginWorker.memoryWrite,
    },
    {
        on: (callback) => addListener('inMemoryStorage', callback),
    },
)
export const indexedDBStorage = createKVStorageHost(
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
