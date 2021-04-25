import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { Emitter } from '@servie/events'
import { useSubscription, Subscription } from 'use-subscription'
import { createManager } from './manage'
import { getPluginDefine, registeredPluginIDs } from './store'
import type { Plugin } from '../types'

const { activatePlugin, stopPlugin, activated } = createManager({
    getLoader: (plugin) => plugin.Dashboard,
})

const events = new Emitter<{ onUpdate: [] }>()
const subscription: Subscription<Plugin.SNSAdaptor.Definition[]> = {
    getCurrentValue: () => [...activated.plugins],
    subscribe: (f) => {
        events.on('onUpdate', f)
        return () => events.off('onUpdate', f)
    },
}
export function useActivatedPluginsDashboard() {
    return useSubscription(subscription)
}
/** Check if the plugin has met it's start requirement. */
function meetStartRequirement(id: string): boolean {
    if (!isEnvironment(Environment.ContentScript)) return false

    const def = getPluginDefine(id)
    if (!def) return false
    // TODO: blockchain check
    return true
}
export function startPluginDashboard() {
    // TODO: listen to blockchain id
    __startPlugins()
}
function __startPlugins() {
    for (const id of registeredPluginIDs) {
        if (meetStartRequirement(id)) activatePlugin(id).catch(console.error)
        else stopPlugin(id)
    }
}
