import { ChainId, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'

import { unreachable } from '@dimensiondev/kit'
import { NFTScanApi, OpenSeaApi, RaribleApi } from '@masknet/web3-providers'

export async function getHistory(
    address: string,
    tokenId: string,
    chainId: ChainId,
    provider: NonFungibleAssetProvider,
    page: number,
    size: number,
) {
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSeaApi.getHistory(address, tokenId, chainId, page, size)
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanApi.getHistory(address, tokenId, chainId)
        case NonFungibleAssetProvider.RARIBLE:
            return RaribleApi.getHistory(address, tokenId)
        default:
            unreachable(provider)
    }
}
