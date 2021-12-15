import { OpenSeaApi, RaribleApi, NFTScanApi } from '@masknet/web3-providers'
import { unreachable } from '@dimensiondev/kit'
import { ChainId, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'

export async function getNFT(address: string, tokenId: string, chainId: ChainId, provider: NonFungibleAssetProvider) {
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSeaApi.getNFT(address, tokenId, chainId)
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanApi.getNFT(address, tokenId, chainId)
        case NonFungibleAssetProvider.RARIBLE:
            return RaribleApi.getNFT(address, tokenId)
        default:
            unreachable(provider)
    }
}
