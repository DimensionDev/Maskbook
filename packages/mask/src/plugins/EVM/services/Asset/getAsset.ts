import { NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { currentChainIdSettings } from '../../../Wallet/settings'

import { unreachable } from '@dimensiondev/kit'
import { NFTScanApi, OpenSeaApi, RaribleApi } from '@masknet/web3-providers'

export async function getAsset(
    address: string,
    tokenId: string,
    chainId = currentChainIdSettings.value,
    provider = NonFungibleAssetProvider.OPENSEA,
) {
    let asset
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            asset = await OpenSeaApi.getAsset(address, tokenId, chainId)
            return asset
        case NonFungibleAssetProvider.NFTSCAN:
            asset = await NFTScanApi.getAsset(address, tokenId, chainId)
            return asset
        case NonFungibleAssetProvider.RARIBLE:
            asset = await RaribleApi.getAsset(address, tokenId, chainId)
            return asset
        default:
            unreachable(provider)
    }
}
