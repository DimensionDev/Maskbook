import { useMemo } from 'react'
import { isEqual } from 'lodash-es'
import { unreachable } from '@masknet/kit'
import { ValueRefWithReady } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { createManager } from './manage.js'
import { getPluginDefine } from './store.js'
import type { SiteAdaptor, Plugin } from '../types.js'

const { events, activated, startDaemon, minimalMode } = createManager((def) => def.SiteAdaptor)
const activatedSub = new ValueRefWithReady<Plugin.SiteAdaptor.Definition[]>([], isEqual)
events.on('activateChanged', () => (activatedSub.value = [...activated.plugins]))

const minimalModeSub = new ValueRefWithReady<string[]>([], isEqual)
events.on('minimalModeChanged', () => (minimalModeSub.value = [...minimalMode]))

export function useActivatedPluginsSiteAdaptor(minimalModeEqualsTo: 'any' | boolean) {
    const minimalMode = useValueRef(minimalModeSub)
    const result = useValueRef(activatedSub)
    return useMemo(() => {
        if (minimalModeEqualsTo === 'any') return result
        else if (minimalModeEqualsTo === true) return result.filter((x) => minimalMode.includes(x.ID))
        else if (minimalModeEqualsTo === false) return result.filter((x) => !minimalMode.includes(x.ID))
        unreachable(minimalModeEqualsTo)
    }, [result, minimalMode, minimalModeEqualsTo])
}
useActivatedPluginsSiteAdaptor.visibility = {
    useMinimalMode: useActivatedPluginsSiteAdaptor.bind(null, true),
    useNotMinimalMode: useActivatedPluginsSiteAdaptor.bind(null, false),
    useAnyMode: useActivatedPluginsSiteAdaptor.bind(null, 'any'),
}

export function useIsMinimalMode(pluginID: string) {
    return useValueRef(minimalModeSub).includes(pluginID)
}

/**
 *
 * @param pluginID Get the plugin ID
 * @param visibility Should invisible plugin included?
 * @returns
 */
export function useActivatedPluginSiteAdaptor(pluginID: string, minimalModeEqualsTo: 'any' | boolean) {
    const plugins = useActivatedPluginsSiteAdaptor(minimalModeEqualsTo)
    const minimalMode = useValueRef(minimalModeSub)

    return useMemo(() => {
        const result = plugins.find((x) => x.ID === pluginID)
        if (!result) return result
        if (minimalModeEqualsTo === 'any') return result
        else if (minimalModeEqualsTo === true) {
            if (minimalMode.includes(result.ID)) return result
            return undefined
        } else if (minimalModeEqualsTo === false) {
            if (minimalMode.includes(result.ID)) return undefined
            return result
        }
        unreachable(minimalModeEqualsTo)
    }, [pluginID, plugins, minimalMode, minimalModeEqualsTo])
}

export function startPluginSiteAdaptor(
    currentNetwork: SiteAdaptor,
    host: Plugin.__Host.Host<Plugin.SiteAdaptor.SiteAdaptorContext>,
) {
    startDaemon(host, (id) => {
        const def = getPluginDefine(id)
        if (!def) return false
        // boolean | undefined
        const status = def.enableRequirement.supports.sites[currentNetwork]
        if (def.enableRequirement.supports.type === 'opt-in' && status !== true) return false
        if (def.enableRequirement.supports.type === 'opt-out' && status === true) return false
        return true
    })
}
