import { startPluginWorker, Plugin } from '@masknet/plugin-infra'
import { createPluginDatabase } from '../../../database/Plugin/wrap-plugin-database'
import { createPluginHost } from '../../../plugin-infra/host'
export default function (signal: AbortSignal) {
    startPluginWorker(createPluginHost(signal, createWorkerContext))
}

function createWorkerContext(id: string, signal: AbortSignal): Plugin.Worker.WorkerContext {
    let storage: Plugin.Worker.Storage<any> = undefined!
    return {
        getStorage() {
            return storage || (storage = createPluginDatabase(id, signal))
        },
    }
}
