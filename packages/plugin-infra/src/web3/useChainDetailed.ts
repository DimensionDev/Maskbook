import { usePluginWeb3StateContext } from './Context'

export function useChainDetailed(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).chainDetailed
}
