import { OpenSeaApi } from '@masknet/web3-providers'
import { ChainId, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { unreachable } from '@dimensiondev/kit'

export async function getCollections(
    address: string,
    chainId: ChainId,
    provider: NonFungibleAssetProvider,
    page?: number,
    size?: number,
) {
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSeaApi.getCollections(address, { chainId, page, size })
        case NonFungibleAssetProvider.RARIBLE:
            return []
        case NonFungibleAssetProvider.NFTSCAN:
            return []
        default:
            unreachable(provider)
    }
}
