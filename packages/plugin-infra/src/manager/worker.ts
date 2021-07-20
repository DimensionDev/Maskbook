import type { Plugin } from '..'
import { createManager } from './manage'

const { startDaemon } = createManager({
    getLoader: (plugin) => plugin.Worker,
})

export function startPluginWorker(host: Plugin.__Host.Host) {
    startDaemon(host)
}
