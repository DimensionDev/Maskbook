import { ChainId, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { OpenSeaApi, RaribleApi, NFTScanApi } from '@masknet/web3-providers'

import { unreachable } from '@dimensiondev/kit'
import type { OrderSide } from '@masknet/web3-providers'

export async function getOrders(
    address: string,
    tokenId: string,
    side: OrderSide,
    chainId: ChainId,
    provider: NonFungibleAssetProvider,
    page: number,
    size: number,
) {
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSeaApi.getOrders(address, tokenId, side, chainId, page, size)
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanApi.getOrders(address, tokenId, side, chainId)
        case NonFungibleAssetProvider.RARIBLE:
            return RaribleApi.getOrders(address, tokenId, side, chainId)
        default:
            unreachable(provider)
    }
}
