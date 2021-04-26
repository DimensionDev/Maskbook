import { Emitter } from '@servie/events'
import { useSubscription, Subscription } from 'use-subscription'
import { createManager } from './manage'
import { getPluginDefine, registeredPluginIDs } from './store'
import type { CurrentSNSNetwork, EthStatusReporter, Plugin } from '../types'
import { __meetEthChainRequirement } from '../utils/internal'

const { activatePlugin, stopPlugin, activated } = createManager({
    getLoader: (plugin) => plugin.SNSAdaptor,
})

const events = new Emitter<{ onUpdate: [] }>()
const subscription: Subscription<Plugin.SNSAdaptor.Definition[]> = {
    getCurrentValue: () => [...activated.plugins],
    subscribe: (f) => {
        return events.on('onUpdate', f)
    },
}
export function useActivatedPluginsSNSAdaptor() {
    return useSubscription(subscription)
}
/** Check if the plugin has met it's start requirement. */
function meetStartRequirement(id: string, network: CurrentSNSNetwork, ethReporter: EthStatusReporter): boolean {
    const def = getPluginDefine(id)
    if (!def) return false
    // boolean | undefined
    const status = def.enableRequirement.networks.networks[network]
    if (def.enableRequirement.networks.type === 'opt-in' && status !== true) return false
    if (def.enableRequirement.networks.type === 'opt-out' && status === true) return false
    return __meetEthChainRequirement(id, ethReporter)
}
export function startPluginSNSAdaptor(
    signal: AbortSignal,
    currentNetwork: CurrentSNSNetwork,
    ethReporter: EthStatusReporter,
) {
    signal.addEventListener('abort', () => [...activated.id].forEach(stopPlugin))
    signal.addEventListener('abort', ethReporter.events.on('change', checkRequirementAndStartOrStop))
    checkRequirementAndStartOrStop()

    function checkRequirementAndStartOrStop() {
        for (const id of registeredPluginIDs) {
            if (meetStartRequirement(id, currentNetwork, ethReporter)) {
                activatePlugin(id).catch(console.error)
            } else stopPlugin(id)
        }
    }
}
