import { ChainId, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { NFTScanApi } from '@masknet/web3-providers'
import { unreachable } from '@dimensiondev/kit'

export async function getNFTBalance(address: string, chainId: ChainId, provider: NonFungibleAssetProvider) {
    switch (provider) {
        case NonFungibleAssetProvider.RARIBLE:
        case NonFungibleAssetProvider.OPENSEA:
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanApi.getContractBalance(address)

        default:
            unreachable(provider)
    }
}
