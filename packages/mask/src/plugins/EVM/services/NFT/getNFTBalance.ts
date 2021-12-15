import { NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { OpenSeaApi, RaribleApi, NFTScanApi } from '@masknet/web3-providers'
import { unreachable } from '@dimensiondev/kit'
import { currentChainIdSettings } from '../../../Wallet/settings'

export async function getNFTBalance(
    address: string,
    contractAddress: string,
    chainId = currentChainIdSettings.value,
    provider = NonFungibleAssetProvider.OPENSEA,
) {
    let balance
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            balance = await OpenSeaApi.getContractBalance(address, contractAddress, chainId)
            return balance
        case NonFungibleAssetProvider.NFTSCAN:
            balance = await NFTScanApi.getContractBalance(address, contractAddress, chainId)
            return balance
        case NonFungibleAssetProvider.RARIBLE:
            balance = await RaribleApi.getContractBalance(address, contractAddress, chainId)
            return balance
        default:
            unreachable(provider)
    }
}
