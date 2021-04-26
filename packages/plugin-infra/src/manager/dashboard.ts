import { Emitter } from '@servie/events'
import { useSubscription, Subscription } from 'use-subscription'
import { createManager } from './manage'
import { registeredPluginIDs } from './store'
import type { EthStatusReporter, Plugin } from '../types'
import { __meetEthChainRequirement } from '../utils/internal'

const { activatePlugin, stopPlugin, activated } = createManager({
    getLoader: (plugin) => plugin.Dashboard,
})

const events = new Emitter<{ onUpdate: [] }>()
const subscription: Subscription<Plugin.Dashboard.Definition[]> = {
    getCurrentValue: () => [...activated.plugins],
    subscribe: (f) => {
        return events.on('onUpdate', f)
    },
}
export function useActivatedPluginsDashboard() {
    return useSubscription(subscription)
}
export function startPluginDashboard(ethReporter: EthStatusReporter) {
    checkRequirementAndStartOrStop()
    function checkRequirementAndStartOrStop() {
        for (const id of registeredPluginIDs) {
            if (__meetEthChainRequirement(id, ethReporter)) activatePlugin(id).catch(console.error)
            else stopPlugin(id)
        }
    }
}
