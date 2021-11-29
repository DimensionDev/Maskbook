import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useNetworkType(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).networkType
}
