import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Plugin } from '../types'
import { useChainId, useCurrentWeb3NetworkPluginID } from '../web3'

type HasRequirement = { enableRequirement: Plugin.Shared.Definition['enableRequirement'] }

function checkPluginAvailable(plugin: HasRequirement, pluginId: NetworkPluginID, chainId: number) {
    const supportedChainIds = plugin.enableRequirement.web3?.[pluginId]?.supportedChainIds
    if (!supportedChainIds) return true
    return supportedChainIds.includes(chainId)
}

export function useAvailablePlugins<T extends HasRequirement>(plugins: T[]) {
    const networkPluginId = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId(networkPluginId)
    return useMemo(
        () => plugins.filter((plugin) => checkPluginAvailable(plugin, networkPluginId, chainId as number)),
        [plugins, networkPluginId, chainId],
    )
}
