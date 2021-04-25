import { getNetwork } from '../../social-network-adaptor'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { Emitter } from '@servie/events'
import { useSubscription, Subscription } from 'use-subscription'
import { createManager } from './manage'
import { getPluginDefine, registeredPluginIDs } from './store'
import type { Plugin } from '../types'

const { activatePlugin, stopPlugin, activated } = createManager({
    getLoader: (plugin) => plugin.SNSAdaptor,
})

const events = new Emitter<{ onUpdate: [] }>()
const subscription: Subscription<Plugin.SNSAdaptor.Definition[]> = {
    getCurrentValue: () => [...activated.plugins],
    subscribe: (f) => {
        events.on('onUpdate', f)
        return () => events.off('onUpdate', f)
    },
}
export function useActivatedPluginsSNSAdaptor() {
    return useSubscription(subscription)
}
/** Check if the plugin has met it's start requirement. */
function meetStartRequirement(id: string): boolean {
    if (!isEnvironment(Environment.ContentScript)) return false

    const def = getPluginDefine(id)
    if (!def) return false
    // SNS adaptor
    const network = getNetwork()
    if (!network) return false
    // boolean | undefined
    const status = def.enableRequirement.networks.networks[network]
    if (def.enableRequirement.networks.type === 'opt-in' && status !== true) return false
    if (def.enableRequirement.networks.type === 'opt-out' && status === true) return false
    // TODO: blockchain check
    return true
}
export function startPluginSNSAdaptor(signal: AbortSignal) {
    signal.addEventListener('abort', () => [...activated.id].forEach(stopPlugin))

    // the current supported network won't change so no need to watch
    // TODO: listen eth chain changes
    __startPlugins()
}
function __startPlugins() {
    for (const id of registeredPluginIDs) {
        if (meetStartRequirement(id)) activatePlugin(id).catch(console.error)
        else stopPlugin(id)
    }
}
