import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useAssetType(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).assetType
}
