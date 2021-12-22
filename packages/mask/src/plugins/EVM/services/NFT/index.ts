import { OpenSeaAPI, RaribleAPI, NFTScanAPI } from '@masknet/web3-providers'
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

export interface NFTsByPaginationOption {
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
            return OpenSeaAPI.getNFT(address, tokenId, chainId)
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanAPI.getNFT(address, tokenId, chainId)
        case NonFungibleAssetProvider.RARIBLE:
            return RaribleAPI.getNFT(address, tokenId)
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
            return NFTScanAPI.getContractBalance(address)

        default:
            unreachable(provider)
    }
}

export async function getNFTContract(options: ContractOption) {
    const { contractAddress, chainId, provider } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
        case NonFungibleAssetProvider.NFTSCAN:
            return OpenSeaAPI.getContract(contractAddress, chainId)
        case NonFungibleAssetProvider.RARIBLE:
            return
        default:
            unreachable(provider)
    }
}

export async function getNFTsByPagination(options: NFTsByPaginationOption) {
    const { provider, from, chainId, page, size } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSeaAPI.getNFTsByPagination(from, { chainId, page, size })
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanAPI.getNFTsByPagination(from, { chainId, page, size })
        case NonFungibleAssetProvider.RARIBLE:
            return RaribleAPI.getNFTsByPagination(from, { chainId, page, size })
        default:
            unreachable(provider)
    }
}
