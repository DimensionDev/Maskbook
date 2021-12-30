import { ALL_EVENTS } from '@servie/events'
import { useSubscription, Subscription } from 'use-subscription'
import { createManager } from './manage'
import { getPluginDefine } from './store'
import type { CurrentSNSNetwork, Plugin } from '../types'
import type { NetworkPluginID } from '..'

const { events, activated, startDaemon } = createManager((def) => def.SNSAdaptor)

const subscription: Subscription<Plugin.SNSAdaptor.Definition[]> = {
    getCurrentValue: () => [...activated.plugins],
    subscribe: (f) => events.on(ALL_EVENTS, f),
}
export function useActivatedPluginsSNSAdaptor() {
    return useSubscription(subscription)
}

export function useActivatedPluginSNSAdaptor(pluginID: string) {
    const plugins = useActivatedPluginsSNSAdaptor()
    return plugins.find((x) => x.ID === pluginID)
}

export function useActivatedPluginSNSAdaptor_Web3Supported(chainId: number, pluginID: string) {
    const plugins = useActivatedPluginsSNSAdaptor()
    return plugins.reduce<Record<string, boolean>>((acc, cur) => {
        if (!cur.enableRequirement.web3) {
            acc[cur.ID] = true
            return acc
        }
        const supportedChainIds = cur.enableRequirement.web3?.[pluginID as NetworkPluginID]?.supportedChainIds
        acc[cur.ID] = supportedChainIds?.includes(chainId) ?? false
        return acc
    }, {})
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
