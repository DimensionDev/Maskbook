import { ALL_EVENTS } from '@servie/events'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'
import type { Subscription } from '@masknet/shared-base'
import { createManager } from './manage'
import type { Plugin } from '../types'

const { activated, startDaemon, events } = createManager((def) => def.Dashboard)

const subscription: Subscription<Plugin.Dashboard.Definition[]> = {
    getCurrentValue: () => [...activated.plugins],
    subscribe: (f) => events.on(ALL_EVENTS, f),
}

export function useActivatedPluginsDashboard() {
    return useSyncExternalStoreWithSelector(
        subscription.subscribe,
        subscription.getCurrentValue,
        subscription.getCurrentValue,
        (s) => s,
    )
}

export function useActivatedPluginDashboard(pluginID: string) {
    const plugins = useSyncExternalStoreWithSelector(
        subscription.subscribe,
        subscription.getCurrentValue,
        subscription.getCurrentValue,
        (s) => s,
    )
    return plugins.find((x) => x.ID === pluginID)
}

export function startPluginDashboard(host: Plugin.__Host.Host<Plugin.Dashboard.DashboardContext>) {
    startDaemon(host)
}
