import { usePluginWeb3StateContext } from './Context'

export function useNetworkType(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).networkType
}
