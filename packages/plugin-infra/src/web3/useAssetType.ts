import { usePluginWeb3StateContext } from '../context'

export function useAssetType() {
    return usePluginWeb3StateContext().assetType
}
