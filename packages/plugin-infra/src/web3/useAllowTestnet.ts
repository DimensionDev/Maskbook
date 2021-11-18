import { usePluginWeb3StateContext } from './Context'

export function useAllowTestnet(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).allowTestnet
}
