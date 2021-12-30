import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useCollectibleType<T extends string>(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).collectibleType as T
}
