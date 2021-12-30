import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useNameType<T extends string>(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).nameType as T
}
