import { unreachable } from '@dimensiondev/kit'
import { ChainId, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { OpenSeaApi } from '@masknet/web3-providers'

export async function getNFTContract(contractAddress: string, chainId: ChainId, provider: NonFungibleAssetProvider) {
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
        case NonFungibleAssetProvider.NFTSCAN:
            return OpenSeaApi.getContract(contractAddress, chainId)
        case NonFungibleAssetProvider.RARIBLE:
            return
        default:
            unreachable(provider)
    }
}
