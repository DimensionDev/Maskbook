import { unreachable } from '@dimensiondev/kit'
import { NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { OpenSeaApi } from '@masknet/web3-providers'
import { currentChainIdSettings } from '../../../Wallet/settings'

export async function getNFTContract(
    contractAddress: string,
    chainId = currentChainIdSettings.value,
    provider = NonFungibleAssetProvider.OPENSEA,
) {
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
        case NonFungibleAssetProvider.NFTSCAN:
            const assetContract = await OpenSeaApi.getContract(contractAddress, chainId)
            return assetContract
        case NonFungibleAssetProvider.RARIBLE:
            return
        default:
            unreachable(provider)
    }
}
