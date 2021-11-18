import { usePluginWeb3StateContext } from './Context'

export function useProviderType(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).providerType
}
