import type { Plugin } from '../types.js'
import { createManager } from './manage.js'

const { startDaemon, activated } = createManager((def) => def.Worker)

export function startPluginWorker(host: Plugin.__Host.Host<Plugin.Worker.Definition, Plugin.Worker.WorkerContext>) {
    startDaemon(host)
}
export const activatedPluginsWorker = activated.plugins
