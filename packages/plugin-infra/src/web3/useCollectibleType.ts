import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useCollectibleType(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).collectibleType
}
