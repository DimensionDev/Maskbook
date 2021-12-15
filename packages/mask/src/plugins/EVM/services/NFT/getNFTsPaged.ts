import { OpenSeaApi, RaribleApi, NFTScanApi } from '@masknet/web3-providers'

import { unreachable } from '@dimensiondev/kit'
import { ChainId, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'

export async function getNFTsPaged(
    from: string,
    chainId: ChainId,
    provider: NonFungibleAssetProvider,
    page?: number,
    size?: number,
) {
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSeaApi.getNFTsPaged(from, { chainId, page, size })
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanApi.getNFTsPaged(from, { chainId, page, size })
        case NonFungibleAssetProvider.RARIBLE:
            return RaribleApi.getNFTsPaged(from, { chainId, page, size })
        default:
            unreachable(provider)
    }
}
