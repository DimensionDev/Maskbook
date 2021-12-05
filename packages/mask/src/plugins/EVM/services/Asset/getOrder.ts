import { NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { currentChainIdSettings } from '../../../Wallet/settings'
import { OpenSeaApi, RaribleApi, NFTScanApi } from '@masknet/web3-providers'

import { unreachable } from '@dimensiondev/kit'
import type { OrderSide } from '@masknet/web3-providers'

export async function getOrder(
    address: string,
    tokenId: string,
    side: OrderSide,
    chainId = currentChainIdSettings.value,
    provider = NonFungibleAssetProvider.OPENSEA,
) {
    let asset
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            asset = await OpenSeaApi.getOrder(address, tokenId, side, chainId)
            return asset
        case NonFungibleAssetProvider.NFTSCAN:
            asset = await NFTScanApi.getOrder(address, tokenId, side, chainId)
            return asset
        case NonFungibleAssetProvider.RARIBLE:
            asset = await RaribleApi.getOrder(address, tokenId, side, chainId)
            return asset
        default:
            unreachable(provider)
    }
}
