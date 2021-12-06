import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useProviderType(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).providerType
}
