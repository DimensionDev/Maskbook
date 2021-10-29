import type { Plugin } from '..'
import { createManager } from './manage'

const { startDaemon, activated } = createManager((def) => def.Worker)

export function startPluginWorker(host: Plugin.__Host.Host<Plugin.Worker.WorkerContext>) {
    startDaemon(host)
}
export const activatedPluginsWorker = activated.plugins
