import { useChainId, usePluginIDContext } from '../web3'
import type { NetworkPluginID } from '../web3-types'
import type { Plugin } from '../types'

type HasRequirement = { enableRequirement: Plugin.Shared.Definition['enableRequirement'] }

function checkPluginAvailable<T extends HasRequirement>(plugin: T, pluginId: NetworkPluginID, chainId: number) {
    const supportedChainIds = plugin.enableRequirement.web3?.[pluginId]?.supportedChainIds
    if (!supportedChainIds) return true
    return supportedChainIds.includes(chainId)
}

export function useAvailabilePlugins<T extends HasRequirement>(plugins: T[]) {
    const networkPluginId = usePluginIDContext()
    const chainId = useChainId(networkPluginId)
    return plugins.filter((plugin) => checkPluginAvailable(plugin, networkPluginId, chainId))
}
