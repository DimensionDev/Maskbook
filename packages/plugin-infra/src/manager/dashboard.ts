import { isEqual } from 'lodash-es'
import { ALL_EVENTS } from '@servie/events'
import { useValueRef } from '@masknet/shared'
import { ValueRefWithReady } from '@masknet/shared-base'
import { createManager } from './manage.js'
import type { Plugin } from '../types.js'

const { activated, startDaemon, events, minimalMode } = createManager((def) => def.Dashboard)

const activatedSub = new ValueRefWithReady<Plugin.Dashboard.Definition[]>([], isEqual)
events.on(ALL_EVENTS, () => (activatedSub.value = [...activated.plugins]))

const minimalModeSub = new ValueRefWithReady<string[]>([], isEqual)
events.on('minimalModeChanged', () => (minimalModeSub.value = [...minimalMode]))

export function useIsMinimalModeDashBoard(pluginID: string) {
    return useValueRef(minimalModeSub).includes(pluginID)
}

export function useActivatedPluginsDashboard() {
    return useValueRef(activatedSub)
}

export function useActivatedPluginDashboard(pluginID: string) {
    const plugins = useValueRef(activatedSub)
    return plugins.find((x) => x.ID === pluginID)
}

export function startPluginDashboard(host: Plugin.__Host.Host<Plugin.Dashboard.DashboardContext>) {
    startDaemon(host)
}
