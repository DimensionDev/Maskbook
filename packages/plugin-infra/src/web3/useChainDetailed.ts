import { usePluginWeb3StateContext } from '../context'

export function useChainDetailed(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).chainDetailed
}
