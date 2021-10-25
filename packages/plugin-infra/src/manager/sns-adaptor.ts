import { ALL_EVENTS } from '@servie/events'
import { useSubscription, Subscription } from 'use-subscription'
import { createManager } from './manage'
import { getPluginDefine } from './store'
import type { CurrentSNSNetwork, Plugin } from '../types'
import { useChainId } from '@masknet/web3-shared-evm'

const { events, activated, startDaemon } = createManager((def) => def.SNSAdaptor)

const subscription: Subscription<Plugin.SNSAdaptor.Definition[]> = {
    getCurrentValue: () => [...activated.plugins],
    subscribe: (f) => events.on(ALL_EVENTS, f),
}
export function useActivatedPluginsSNSAdaptor() {
    return useSubscription(subscription)
}

export function useActivatedPluginSNSAdaptorWithOperatingChainSupportedMet() {
    const chainId = useChainId()
    const plugins = useActivatedPluginsSNSAdaptor()
    return plugins.reduce<Record<string, boolean>>((acc, cur) => {
        const operatingSupportedChains = cur.enableRequirement.web3?.operatingSupportedChains
        acc[cur.ID] = !Boolean(operatingSupportedChains) || Boolean(operatingSupportedChains?.includes(chainId))
        return acc
    }, {})
}

export function startPluginSNSAdaptor(currentNetwork: CurrentSNSNetwork, host: Plugin.__Host.Host) {
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
