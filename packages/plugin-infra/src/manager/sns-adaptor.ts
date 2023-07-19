import { useMemo } from 'react'
import { isEqual } from 'lodash-es'
import { unreachable } from '@masknet/kit'
import { type NetworkPluginID, ValueRefWithReady } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { createManager } from './manage.js'
import { getPluginDefine } from './store.js'
import type { CurrentSNSNetwork, Plugin } from '../types.js'

const { events, activated, startDaemon, minimalMode } = createManager((def) => def.SNSAdaptor)
const activatedSub = new ValueRefWithReady<Plugin.SNSAdaptor.Definition[]>([], isEqual)
events.on('activateChanged', () => (activatedSub.value = [...activated.plugins]))

const minimalModeSub = new ValueRefWithReady<string[]>([], isEqual)
events.on('minimalModeChanged', () => (minimalModeSub.value = [...minimalMode]))

export function useActivatedPluginsSNSAdaptor(minimalModeEqualsTo: 'any' | boolean) {
    const minimalMode = useValueRef(minimalModeSub)
    const result = useValueRef(activatedSub)
    return useMemo(() => {
        if (minimalModeEqualsTo === 'any') return result
        else if (minimalModeEqualsTo === true) return result.filter((x) => minimalMode.includes(x.ID))
        else if (minimalModeEqualsTo === false) return result.filter((x) => !minimalMode.includes(x.ID))
        unreachable(minimalModeEqualsTo)
    }, [result, minimalMode, minimalModeEqualsTo])
}
useActivatedPluginsSNSAdaptor.visibility = {
    useMinimalMode: useActivatedPluginsSNSAdaptor.bind(null, true),
    useNotMinimalMode: useActivatedPluginsSNSAdaptor.bind(null, false),
    useAnyMode: useActivatedPluginsSNSAdaptor.bind(null, 'any'),
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
export function useActivatedPluginSNSAdaptor(pluginID: string, minimalModeEqualsTo: 'any' | boolean) {
    const plugins = useActivatedPluginsSNSAdaptor(minimalModeEqualsTo)
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

export function useActivatedPluginSNSAdaptor_Web3Supported(chainId: number, pluginID: string) {
    const plugins = useActivatedPluginsSNSAdaptor('any')
    const entries = plugins.map((plugin): [string, boolean] => {
        if (!plugin.enableRequirement.web3) return [plugin.ID, true]
        const supportedChainIds = plugin.enableRequirement.web3?.[pluginID as NetworkPluginID]?.supportedChainIds
        return [plugin.ID, supportedChainIds?.includes(chainId) ?? false]
    })
    return Object.fromEntries(entries) as Record<string, boolean>
}

export function startPluginSNSAdaptor(
    currentNetwork: CurrentSNSNetwork,
    host: Plugin.__Host.Host<Plugin.SNSAdaptor.SNSAdaptorContext>,
) {
    startDaemon(host, (id) => {
        const def = getPluginDefine(id)
        if (!def) return false
        // boolean | undefined
        const status = def.enableRequirement.networks.networks[currentNetwork]
        if (def.enableRequirement.networks.type === 'opt-in' && status !== true) return false
        if (def.enableRequirement.networks.type === 'opt-out' && status === true) return false
        return true
    })
}
