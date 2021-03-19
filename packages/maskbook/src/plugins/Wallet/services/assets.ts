import { AssetProvider } from '../types'
import * as OpenSeaAPI from '../apis/opensea'
import type { AssetInCard } from '../../../plugins/Wallet/apis/opensea'

export async function getAssetsListNFT(address: string, provider: AssetProvider) {
    if (provider === AssetProvider.OPENSEAN) {
        const { assets } = await OpenSeaAPI.getAssetsList(address)
        return assets.map(
            (x) =>
                ({
                    asset_contract: {
                        address: x.asset_contract.address,
                        symbol: x.asset_contract.symbol,
                        schema_name: x.asset_contract.schema_name,
                    },
                    token_id: x.token_id,
                    name: x.name ?? x.collection.slug,
                    image: x.image_url ?? x.image_preview_url ?? '',
                    permalink: x.permalink,
                } as AssetInCard),
        )
    }
    return []
}
