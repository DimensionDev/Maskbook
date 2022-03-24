import { OpenSea, Rarible, NFTScan, Zora, Treasure } from '@masknet/web3-providers'
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
    pageInfo?: { [key in string]: unknown }
}

export async function getNFT(options: NFTOption) {
    const { address, tokenId, chainId, provider } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSea.getToken(address, tokenId, chainId)
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScan.getToken(address, tokenId)
        case NonFungibleAssetProvider.RARIBLE:
            return Rarible.getToken(address, tokenId)
        case NonFungibleAssetProvider.ZORA:
            return Zora.getToken(address, tokenId)
        case NonFungibleAssetProvider.TREASURE:
            return Treasure.getToken(address, tokenId)
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
        case NonFungibleAssetProvider.ZORA:
        case NonFungibleAssetProvider.TREASURE:
            return NFTScan.getContractBalance(address)

        default:
            unreachable(provider)
    }
}

export async function getNFTContract(options: ContractOption) {
    const { contractAddress, chainId, provider } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
        case NonFungibleAssetProvider.NFTSCAN:
            return OpenSea.getContract(contractAddress, chainId)
        case NonFungibleAssetProvider.RARIBLE:
            return
        case NonFungibleAssetProvider.ZORA:
            return
        case NonFungibleAssetProvider.TREASURE:
            return
        default:
            unreachable(provider)
    }
}

export async function getNFTsByPagination(options: NFTsByPaginationOption) {
    const { provider, from, chainId, page, size } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSea.getTokens(from, options)
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScan.getTokens(from, options)
        case NonFungibleAssetProvider.RARIBLE:
            return Rarible.getTokens(from, options)
        case NonFungibleAssetProvider.ZORA:
            return Rarible.getTokens(from, options)
        case NonFungibleAssetProvider.TREASURE:
            return Treasure.getTokens(from, options)
        default:
            unreachable(provider)
    }
}
