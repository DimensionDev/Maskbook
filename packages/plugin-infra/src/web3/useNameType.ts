import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useNameType(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).nameType
}
