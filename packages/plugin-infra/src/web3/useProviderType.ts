import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useProviderType<T extends string>(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).providerType as T
}
