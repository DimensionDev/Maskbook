import type { Plugin } from '..'
import { createManager } from './manage'

const { startDaemon, activated } = createManager({
    getLoader: (plugin) => plugin.Worker,
})

export function startPluginWorker(host: Plugin.__Host.Host) {
    startDaemon(host)
}
export const activatedPluginsWorker = activated.plugins
