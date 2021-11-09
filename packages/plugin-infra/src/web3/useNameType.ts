import { usePluginWeb3StateContext } from '../context'

export function useNameType(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).nameType
}
