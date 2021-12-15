import { ChainId, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'

import { unreachable } from '@dimensiondev/kit'
import { NFTScanApi, OpenSeaApi, RaribleApi } from '@masknet/web3-providers'

export async function getAsset(address: string, tokenId: string, chainId: ChainId, provider: NonFungibleAssetProvider) {
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSeaApi.getAsset(address, tokenId, chainId)
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanApi.getAsset(address, tokenId, chainId)
        case NonFungibleAssetProvider.RARIBLE:
            return RaribleApi.getAsset(address, tokenId, chainId)
        default:
            unreachable(provider)
    }
}
