import { usePluginWeb3StateContext } from './Context'

export function useCollectibleType(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).collectibleType
}
