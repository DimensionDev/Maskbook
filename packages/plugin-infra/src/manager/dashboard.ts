import { ALL_EVENTS } from '@servie/events'
import { useSubscription, Subscription } from 'use-subscription'
import { createManager } from './manage.js'
import type { Plugin } from '../types.js'

const { activated, startDaemon, events, minimalMode } = createManager((def) => def.Dashboard)

const subscription: Subscription<Plugin.Dashboard.Definition[]> = (() => {
    let value: any[] | undefined
    events.on('activateChanged', () => (value = undefined))
    return {
        getCurrentValue: () => (value ??= [...activated.plugins]),
        subscribe: (f) => events.on(ALL_EVENTS, f),
    }
})()

const minimalModeSub: Subscription<string[]> = (() => {
    let value: any[] | undefined
    events.on('minimalModeChanged', () => (value = undefined))
    return {
        getCurrentValue: () => (value ??= [...minimalMode]),
        subscribe: (f) => events.on('minimalModeChanged', f),
    }
})()

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
