import { usePluginWeb3StateContext } from '../context'

export function useNetworkType(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).networkType
}
