import { OpenSeaApi, RaribleApi, NFTScanApi } from '@masknet/web3-providers'
import { unreachable } from '@dimensiondev/kit'
import { ChainId, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'

export interface NFTOption {
    address: string
    tokenId: string
    chainId: ChainId
    provider: NonFungibleAssetProvider
}

export interface BalanceOption {
    address: string
    chainId: ChainId
    provider: NonFungibleAssetProvider
}

export interface ContractOption {
    contractAddress: string
    chainId: ChainId
    provider: NonFungibleAssetProvider
}

export interface NFTsByPaginationsOption {
    from: string
    chainId: ChainId
    provider: NonFungibleAssetProvider
    page: number
    size: number
}

export async function getNFT(options: NFTOption) {
    const { address, tokenId, chainId, provider } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSeaApi.getNFT(address, tokenId, chainId)
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanApi.getNFT(address, tokenId, chainId)
        case NonFungibleAssetProvider.RARIBLE:
            return RaribleApi.getNFT(address, tokenId)
        default:
            unreachable(provider)
    }
}

export async function getNFTBalance(options: BalanceOption) {
    const { address, chainId, provider } = options
    switch (provider) {
        case NonFungibleAssetProvider.RARIBLE:
        case NonFungibleAssetProvider.OPENSEA:
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanApi.getContractBalance(address)

        default:
            unreachable(provider)
    }
}

export async function getNFTContract(options: ContractOption) {
    const { contractAddress, chainId, provider } = options
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

export async function getNFTsByPaginations(options: NFTsByPaginationsOption) {
    const { provider, from, chainId, page, size } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSeaApi.getNFTsByPaginations(from, { chainId, page, size })
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanApi.getNFTsByPaginations(from, { chainId, page, size })
        case NonFungibleAssetProvider.RARIBLE:
            return RaribleApi.getNFTsByPaginations(from, { chainId, page, size })
        default:
            unreachable(provider)
    }
}
