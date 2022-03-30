import { useMemo } from 'react'
import type { Plugin } from '../types'
import { useChainId, usePluginIDContext } from '../web3'
import type { NetworkPluginID } from '../web3-types'

type HasRequirement = { enableRequirement: Plugin.Shared.Definition['enableRequirement'] }

function checkPluginAvailable(plugin: HasRequirement, pluginId: NetworkPluginID, chainId: number) {
    const supportedChainIds = plugin.enableRequirement.web3?.[pluginId]?.supportedChainIds
    if (!supportedChainIds) return true
    return supportedChainIds.includes(chainId)
}

export function useAvailablePlugins<T extends HasRequirement>(plugins: T[]) {
    const networkPluginId = usePluginIDContext()
    const chainId = useChainId(networkPluginId)
    return useMemo(
        () => plugins.filter((plugin) => checkPluginAvailable(plugin, networkPluginId, chainId)),
        [plugins, networkPluginId, chainId],
    )
}
