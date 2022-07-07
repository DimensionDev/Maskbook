import { ALL_EVENTS } from '@servie/events'
import { useSubscription, Subscription } from 'use-subscription'
import { createManager } from './manage'
import type { Plugin } from '../types'

const { activated, startDaemon, events, minimalMode } = createManager((def) => def.Dashboard)

const subscription: Subscription<Plugin.Dashboard.Definition[]> = {
    getCurrentValue: () => [...activated.plugins],
    subscribe: (f) => events.on(ALL_EVENTS, f),
}

const minimalModeSub: Subscription<string[]> = {
    getCurrentValue: () => [...minimalMode],
    subscribe: (f) => events.on('minimalModeChanged', f),
}

export function useIsMinimalModeDashBoard(pluginID: string) {
    return useSubscription(minimalModeSub).includes(pluginID)
}

export function useActivatedPluginsDashboard() {
    return useSubscription(subscription)
}

export function useActivatedPluginDashboard(pluginID: string) {
    const plugins = useSubscription(subscription)
    return plugins.find((x) => x.ID === pluginID)
}

export function startPluginDashboard(host: Plugin.__Host.Host<Plugin.Dashboard.DashboardContext>) {
    startDaemon(host)
}
