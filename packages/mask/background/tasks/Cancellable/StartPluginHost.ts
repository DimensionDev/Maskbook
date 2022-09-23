import { startPluginWorker, Plugin } from '@masknet/plugin-infra/background-worker'
import { createPluginDatabase } from '../../database/plugin-db/index.js'
import { createPluginHost, createSharedContext } from '../../../shared/plugin-infra/host.js'
import { getPluginMinimalModeEnabled } from '../../services/settings/old-settings-accessor.js'
import { hmr } from '../../../utils-pure/index.js'
import { hasHostPermission } from '../../services/helper/request-permission.js'

const { signal } = hmr(import.meta.webpackHot)
startPluginWorker(createPluginHost(signal, createWorkerContext, getPluginMinimalModeEnabled, hasHostPermission))

function createWorkerContext(pluginID: string, signal: AbortSignal): Plugin.Worker.WorkerContext {
    let storage: Plugin.Worker.DatabaseStorage<any> = undefined!

    return {
        ...createSharedContext(pluginID, signal),
        getDatabaseStorage() {
            return storage || (storage = createPluginDatabase(pluginID, signal))
        },
    }
}
