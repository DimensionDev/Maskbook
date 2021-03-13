import { AssetProvider } from '../types'
import * as OpenSeaAPI from '../apis/opensea'

export async function getAssetsListNFT(address: string, provider: AssetProvider) {
    if (provider === AssetProvider.OPENSEAN) {
        const { data } = await OpenSeaAPI.getAssetsList(address)
        return data.search.edges.map((x) => x.node.asset)
    }
    return []
}
