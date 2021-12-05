import { OpenSeaApi, RaribleApi, NFTScanApi } from '@masknet/web3-providers'

import { unreachable } from '@dimensiondev/kit'
import { NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { currentChainIdSettings } from '../../../Wallet/settings'

export async function getNFTsPaged(
    from: string,
    chainId = currentChainIdSettings.value,
    provider = NonFungibleAssetProvider.OPENSEA,
    page?: number,
    size?: number,
) {
    let assets
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            assets = await OpenSeaApi.getNFTsPaged(from, { chainId, page, size })
            return assets
        case NonFungibleAssetProvider.NFTSCAN:
            assets = await NFTScanApi.getNFTsPaged(from, { chainId, page, size })
            return assets
        case NonFungibleAssetProvider.RARIBLE:
            assets = await RaribleApi.getNFTsPaged(from, { chainId, page, size })
            return assets
        default:
            unreachable(provider)
    }
}
