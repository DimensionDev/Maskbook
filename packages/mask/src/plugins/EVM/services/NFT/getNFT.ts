import { OpenSeaApi, RaribleApi, NFTScanApi } from '@masknet/web3-providers'
import { unreachable } from '@dimensiondev/kit'
import { NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { currentChainIdSettings } from '../../../Wallet/settings'

export async function getNFT(
    address: string,
    tokenId: string,
    chainId = currentChainIdSettings.value,
    provider = NonFungibleAssetProvider.OPENSEA,
) {
    let token
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            token = await OpenSeaApi.getNFT(address, tokenId, chainId)
            return token
        case NonFungibleAssetProvider.NFTSCAN:
            token = await NFTScanApi.getNFT(address, tokenId, chainId)
            return token
        case NonFungibleAssetProvider.RARIBLE:
            token = await RaribleApi.getNFT(address, tokenId)
            return token
        default:
            unreachable(provider)
    }
}
