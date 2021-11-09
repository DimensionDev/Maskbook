import { usePluginWeb3StateContext } from '../context'

export function useAllowTestnet(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).allowTestnet
}
