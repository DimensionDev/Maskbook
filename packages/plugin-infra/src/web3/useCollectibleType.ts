import { usePluginWeb3StateContext } from '../context'

export function useCollectibleType(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).collectibleType
}
