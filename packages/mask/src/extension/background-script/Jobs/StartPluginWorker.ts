import { startPluginWorker, Plugin } from '@masknet/plugin-infra'
import { InMemoryStorages, PersistentStorages } from '../../../../shared'
import { createPluginDatabase } from '../../../database/Plugin/wrap-plugin-database'
import { createPluginHost } from '../../../plugin-infra/host'
export default function (signal: AbortSignal) {
    startPluginWorker(createPluginHost(signal, createWorkerContext))
}

function createWorkerContext(pluginID: string, signal: AbortSignal): Plugin.Worker.WorkerContext {
    let storage: Plugin.Worker.DatabaseStorage<any> = undefined!
    return {
        getDatabaseStorage() {
            return storage || (storage = createPluginDatabase(pluginID, signal))
        },
        createKVStorage(type, defaultValues) {
            if (type === 'memory') return InMemoryStorages.Plugin.createSubscope(pluginID, defaultValues, signal)
            else return PersistentStorages.Plugin.createSubscope(pluginID, defaultValues, signal)
        },
    }
}
