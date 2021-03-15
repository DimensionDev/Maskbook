import { AssetProvider } from '../types'
import * as OpenSeaAPI from '../apis/opensea'

export async function getAssetsListNFT(address: string, provider: AssetProvider) {
    if (provider === AssetProvider.OPENSEAN) {
        const { assets } = await OpenSeaAPI.getAssetsList(address)
        return assets
    }
    return []
}
