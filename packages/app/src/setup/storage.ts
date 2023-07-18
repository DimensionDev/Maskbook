import { createKVStorageHost, setupMaskKVStorageBackend } from '@masknet/shared-base'
import { addListener } from './message.js'
import { BackgroundWorker } from './rpc.js'

const inMemoryBackend = {
    beforeAutoSync: Promise.resolve(),
    getValue: BackgroundWorker.memoryRead,
    setValue: BackgroundWorker.memoryWrite,
}
// #region Setup storage
export const inMemoryStorage = createKVStorageHost(inMemoryBackend, {
    on: (callback) => addListener('inMemoryStorage', callback),
})
const idbBackend = {
    beforeAutoSync: Promise.resolve(),
    getValue: BackgroundWorker.indexedDBRead,
    setValue: BackgroundWorker.indexedDBWrite,
}
export const indexedDBStorage = createKVStorageHost(idbBackend, {
    on: (callback) => addListener('indexedDBStorage', callback),
})
setupMaskKVStorageBackend(idbBackend, inMemoryBackend)
// #endregion
