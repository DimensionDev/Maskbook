import { isEqual } from 'lodash-es'
import { ALL_EVENTS } from '@servie/events'
import { ValueRefWithReady, getSiteType } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { createManager } from './manage.js'
import type { Plugin } from '../types.js'
import { getPluginDefine } from './store.js'

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
    startDaemon(host, (id) => {
        const def = getPluginDefine(id)
        if (!def) return false

        const currentNetwork = getSiteType()
        if (!currentNetwork) return false

        const status = def.enableRequirement.supports.sites[currentNetwork]
        if (def.enableRequirement.supports.type === 'opt-in' && status !== true) return false
        if (def.enableRequirement.supports.type === 'opt-out' && status === true) return false
        return true
    })
}
