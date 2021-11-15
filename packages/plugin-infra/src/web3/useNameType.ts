import { usePluginWeb3StateContext } from './Context'

export function useNameType(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).nameType
}
