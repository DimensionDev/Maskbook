import { ALL_EVENTS } from '@servie/events'
import { useSubscription, Subscription } from 'use-subscription'
import { createManager } from './manage'
import type { Plugin, PluginHost } from '../types'

const { activated, startDaemon, events } = createManager({
    getLoader: (plugin) => plugin.Dashboard,
})

const subscription: Subscription<Plugin.Dashboard.Definition[]> = {
    getCurrentValue: () => [...activated.plugins],
    subscribe: (f) => events.on(ALL_EVENTS, f),
}
export function useActivatedPluginsDashboard() {
    return useSubscription(subscription)
}
export function startPluginDashboard(host: PluginHost) {
    startDaemon(host)
}
