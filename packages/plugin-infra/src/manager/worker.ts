import { createManager } from './manage'
import { getPluginDefine, registeredPluginIDs } from './store'

const { activatePlugin, stopPlugin } = createManager({
    getLoader: (plugin) => plugin.Worker,
})

/** Check if the plugin has met it's start requirement. */
function meetStartRequirement(id: string): boolean {
    const def = getPluginDefine(id)
    if (!def) return false
    // TODO: blockchain check
    return true
}
export function startPluginWorker() {
    // TODO: listen to blockchain id
    __startPlugins()
}
function __startPlugins() {
    for (const id of registeredPluginIDs) {
        if (meetStartRequirement(id)) activatePlugin(id).catch(console.error)
        else stopPlugin(id)
    }
}
