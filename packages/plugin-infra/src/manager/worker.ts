import type { EthStatusReporter } from '..'
import { __meetEthChainRequirement } from '../utils/internal'
import { createManager } from './manage'
import { registeredPluginIDs } from './store'

const { activatePlugin, stopPlugin } = createManager({
    getLoader: (plugin) => plugin.Worker,
})

export function startPluginWorker(ethReporter: EthStatusReporter) {
    ethReporter.events.on('change', checkRequirementAndStartOrStop)
    checkRequirementAndStartOrStop()

    function checkRequirementAndStartOrStop() {
        for (const id of registeredPluginIDs) {
            if (__meetEthChainRequirement(id, ethReporter)) activatePlugin(id).catch(console.error)
            else stopPlugin(id)
        }
    }
}
