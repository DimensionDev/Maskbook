import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useAssetType<T extends string>(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).assetType as T
}
