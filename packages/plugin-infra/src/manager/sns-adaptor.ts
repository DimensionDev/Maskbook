import { unreachable } from '@dimensiondev/kit'
import { useSubscription, Subscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { createManager } from './manage'
import { getPluginDefine } from './store'
import type { CurrentSNSNetwork, Plugin } from '../types'
import { useMemo } from 'react'

const { events, activated, startDaemon, minimalMode } = createManager((def) => def.SNSAdaptor)

const activatedSub: Subscription<Plugin.SNSAdaptor.Definition[]> = {
    getCurrentValue: () => [...activated.plugins],
    subscribe: (f) => events.on('activateChanged', f),
}
const minimalModeSub: Subscription<string[]> = {
    getCurrentValue: () => [...minimalMode],
    subscribe: (f) => events.on('minimalModeChanged', f),
}
export function useActivatedPluginsSNSAdaptor(minimalModeEqualsTo: 'any' | boolean) {
    const minimalMode = useSubscription(minimalModeSub)
    const result = useSubscription(activatedSub)
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
    return useSubscription(minimalModeSub).includes(pluginID)
}

/**
 *
 * @param pluginID Get the plugin ID
 * @param visibility Should invisible plugin included?
 * @returns
 */
export function useActivatedPluginSNSAdaptor(pluginID: string, minimalModeEqualsTo: 'any' | boolean) {
    const plugins = useActivatedPluginsSNSAdaptor(minimalModeEqualsTo)
    const minimalMode = useSubscription(minimalModeSub)

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

    return useMemo(() => {
        // TODO: 6002
        // eslint-disable-next-line unicorn/no-array-reduce
        return plugins.reduce<Record<string, boolean>>((result, plugin) => {
            if (!plugin.enableRequirement.web3) {
                result[plugin.ID] = true
                return result
            }
            const supportedChainIds = plugin.enableRequirement.web3?.[pluginID as NetworkPluginID]?.supportedChainIds
            result[plugin.ID] = supportedChainIds?.includes(chainId) ?? false
            return result
        }, {})
    }, [chainId, pluginID, plugins])
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
