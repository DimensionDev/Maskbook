import { usePluginWeb3StateContext } from './Context'

export function useAssetType(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).assetType
}
