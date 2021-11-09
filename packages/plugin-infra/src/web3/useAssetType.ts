import { usePluginWeb3StateContext } from '../context'

export function useAssetType(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).assetType
}
