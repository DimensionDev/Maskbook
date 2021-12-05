import { NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { currentChainIdSettings } from '../../../Wallet/settings'
import { OpenSeaApi, RaribleApi, NFTScanApi } from '@masknet/web3-providers'

import { unreachable } from '@dimensiondev/kit'

export async function getListings(
    address: string,
    tokenId: string,
    chainId = currentChainIdSettings.value,
    provider = NonFungibleAssetProvider.OPENSEA,
) {
    let asset
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            asset = await OpenSeaApi.getListings(address, tokenId, chainId)
            return asset
        case NonFungibleAssetProvider.NFTSCAN:
            asset = await NFTScanApi.getListings(address, tokenId, chainId)
            return asset
        case NonFungibleAssetProvider.RARIBLE:
            asset = await RaribleApi.getListings(address, tokenId, chainId)
            return asset
        default:
            unreachable(provider)
    }
}
