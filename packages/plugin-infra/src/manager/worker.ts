import type { PluginHost } from '..'
import { createManager } from './manage'

const { startDaemon } = createManager({
    getLoader: (plugin) => plugin.Worker,
})

export function startPluginWorker(host: PluginHost) {
    startDaemon(host)
}
