import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useChainId<T extends number>(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).chainId as T
}
