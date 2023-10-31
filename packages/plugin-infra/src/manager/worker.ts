import type { Plugin } from '../types.js'
import { startPluginGeneratorRPC, startPluginRPC } from '../utils/rpc.js'
import { createManager } from './manage.js'

const { startDaemon, activated } = createManager<
    Plugin.Worker.Definition,
    Plugin.Worker.WorkerContext,
    'startService' | 'startGeneratorService'
>(
    (def) => def.Worker,
    (id, signal) => ({
        startGeneratorService(impl) {
            startPluginGeneratorRPC(id, signal, impl)
        },
        startService(impl) {
            startPluginRPC(id, signal, impl)
        },
    }),
)

export function startPluginWorker(host: Plugin.__Host.Host<Plugin.Worker.Definition, Plugin.__Host.WorkerContext>) {
    startDaemon(host)
}
export const activatedPluginsWorker = activated.plugins
