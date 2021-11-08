import { useWeb3StateContext } from '.'

export function useAssetType() {
    return useWeb3StateContext().assetType
}
