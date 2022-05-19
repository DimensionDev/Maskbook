import { useMemo } from 'react'
import type { Plugin } from '../types'
import { useChainId, useCurrentWeb3NetworkPluginID } from '../web3'
import type { NetworkPluginID } from '../web3-types'

type HasRequirement = { enableRequirement: Plugin.Shared.Definition['enableRequirement'] }

function checkPluginAvailable(plugin: HasRequirement, pluginId: NetworkPluginID, chainId: number) {
    /* don't check web3 at timeline */
    return true
}

export function useAvailablePlugins<T extends HasRequirement>(plugins: T[]) {
    const networkPluginId = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId(networkPluginId)
    return useMemo(
        () => plugins.filter((plugin) => checkPluginAvailable(plugin, networkPluginId, chainId)),
        [plugins, networkPluginId, chainId],
    )
}
