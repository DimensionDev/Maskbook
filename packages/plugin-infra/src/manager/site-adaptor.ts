import { unreachable } from '@masknet/kit'
import { useValueRef } from '@masknet/shared-base-ui'
import { type EnhanceableSite, ValueRefWithReady, Sniffings } from '@masknet/shared-base'
import { createManager } from './manage.js'
import { getPluginDefine } from './store.js'
import type { Plugin } from '../types.js'

const {
    events,
    activated,
    startDaemon,
    minimalMode: minimalModeSub,
} = createManager((def) => def.SiteAdaptor, createManager.NoManagedContext)

const ActivatedPluginsSiteAdaptorAny = new ValueRefWithReady<Plugin.SiteAdaptor.Definition[]>([])
const ActivatedPluginsSiteAdaptorTrue = new ValueRefWithReady<Plugin.SiteAdaptor.Definition[]>([])
const ActivatedPluginsSiteAdaptorFalse = new ValueRefWithReady<Plugin.SiteAdaptor.Definition[]>([])

{
    const update = () => {
        ActivatedPluginsSiteAdaptorTrue.value = query(true)
        ActivatedPluginsSiteAdaptorFalse.value = query(false)
    }
    events.on('activateChanged', () => {
        ActivatedPluginsSiteAdaptorAny.value = [...activated.plugins]
    })
    events.on('activateChanged', update)
    events.on('minimalModeChanged', update)

    function query(minimalModeEqualsTo: boolean): Plugin.SiteAdaptor.Definition[] {
        const result = [...activated.plugins]
        if (minimalModeEqualsTo === true) return result.filter((x) => minimalModeSub[x.ID]?.value)
        else if (minimalModeEqualsTo === false) return result.filter((x) => !minimalModeSub[x.ID]?.value)
        return result
    }
}

export function useActivatedPluginsSiteAdaptor(minimalModeEqualsTo: 'any' | boolean) {
    assertLocation()
    return useValueRef(
        minimalModeEqualsTo === 'any' ? ActivatedPluginsSiteAdaptorAny
        : minimalModeEqualsTo === true ? ActivatedPluginsSiteAdaptorTrue
        : minimalModeEqualsTo === false ? ActivatedPluginsSiteAdaptorFalse
        : unreachable(minimalModeEqualsTo),
    )
}

function assertLocation() {
    if (Sniffings.is_popup_page || Sniffings.is_dashboard_page) {
        throw new Error('This hook should not be called in popup or dashboard.')
    }
}

export function useActivatedPluginsSiteAdaptorMinimal() {
    assertLocation()
    return useValueRef(ActivatedPluginsSiteAdaptorTrue)
}
export function useActivatedPluginsSiteAdaptorNotMinimal() {
    assertLocation()
    return useValueRef(ActivatedPluginsSiteAdaptorFalse)
}
export function useActivatedPluginsSiteAdaptorAny() {
    assertLocation()
    return useValueRef(ActivatedPluginsSiteAdaptorAny)
}
useActivatedPluginsSiteAdaptor.visibility = {
    useMinimalMode: useActivatedPluginsSiteAdaptorMinimal,
    useNotMinimalMode: useActivatedPluginsSiteAdaptorNotMinimal,
    useAnyMode: useActivatedPluginsSiteAdaptorAny,
}

// this should never be used for a normal plugin
export function useIsMinimalMode(pluginID: string) {
    assertLocation()
    const minimalPlugins = useActivatedPluginsSiteAdaptorMinimal()
    return minimalPlugins.some((p) => p.ID === pluginID)
}

export async function checkIsMinimalMode(pluginID: string) {
    assertLocation()
    const sub = minimalModeSub[pluginID]
    if (!sub) return true
    await sub.readyPromise
    return sub.value
}
/**
 *
 * @param pluginID Get the plugin ID
 * @param visibility Should invisible plugin included?
 * @returns
 */
export function useActivatedPluginSiteAdaptor(pluginID: string, minimalModeEqualsTo: 'any' | boolean) {
    const plugins = useActivatedPluginsSiteAdaptor(minimalModeEqualsTo)
    const minimalMode = useIsMinimalMode(pluginID)

    const result = plugins.find((x) => x.ID === pluginID)
    if (!result) return undefined
    if (minimalModeEqualsTo === 'any') return result
    else if (minimalModeEqualsTo === true) {
        if (minimalMode) return result
        return undefined
    } else if (minimalModeEqualsTo === false) {
        if (minimalMode) return undefined
        return result
    }
    unreachable(minimalModeEqualsTo)
}
export function useActivatedPluginSiteAdaptorMinimal(pluginID: string) {
    return useActivatedPluginSiteAdaptor(pluginID, true)
}
export function useActivatedPluginSiteAdaptorNotMinimal(pluginID: string) {
    return useActivatedPluginSiteAdaptor(pluginID, false)
}
export function useActivatedPluginSiteAdaptorAny(pluginID: string) {
    return useActivatedPluginSiteAdaptor(pluginID, 'any')
}
useActivatedPluginSiteAdaptor.visibility = {
    useMinimalMode: useActivatedPluginSiteAdaptorMinimal,
    useNotMinimalMode: useActivatedPluginSiteAdaptorNotMinimal,
    useAnyMode: useActivatedPluginSiteAdaptorAny,
}

export function startPluginSiteAdaptor(
    currentNetwork: EnhanceableSite,
    host: Plugin.__Host.Host<Plugin.SiteAdaptor.Definition, Plugin.SiteAdaptor.SiteAdaptorContext>,
) {
    startDaemon(host, (id) => {
        const def = getPluginDefine(id)
        if (!def) return false

        const status = def.enableRequirement.supports.sites[currentNetwork]
        if (def.enableRequirement.supports.type === 'opt-in' && status !== true) return false
        if (def.enableRequirement.supports.type === 'opt-out' && status === true) return false
        return true
    })
}
