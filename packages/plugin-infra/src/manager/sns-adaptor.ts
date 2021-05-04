import { ALL_EVENTS } from '@servie/events'
import { useSubscription, Subscription } from 'use-subscription'
import { createManager } from './manage'
import { getPluginDefine } from './store'
import type { CurrentSNSNetwork, Plugin } from '../types'

const { events, activated, startDaemon } = createManager({
    getLoader: (plugin) => plugin.SNSAdaptor,
})

const subscription: Subscription<Plugin.SNSAdaptor.Definition[]> = {
    getCurrentValue: () => [...activated.plugins],
    subscribe: (f) => events.on(ALL_EVENTS, f),
}
export function useActivatedPluginsSNSAdaptor() {
    return useSubscription(subscription)
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
