import { usePluginWeb3StateContext } from '../context'

export function useProviderType(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).providerType
}
