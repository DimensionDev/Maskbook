import { unreachable } from '@dimensiondev/kit'
import { ChainId, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { NonFungibleTokenAPI, OpenSea, Rarible } from '@masknet/web3-providers'

export interface AssetOption {
    address: string
    tokenId: string
    chainId: ChainId
    provider: NonFungibleAssetProvider
}

export interface OrderOption {
    address: string
    tokenId: string
    side: NonFungibleTokenAPI.OrderSide
    chainId: ChainId
    provider: NonFungibleAssetProvider
    page: number
    size: number
}

export interface ListOption {
    address: string
    tokenId: string
    chainId: ChainId
    provider: NonFungibleAssetProvider
}

export interface HistoryOption {
    address: string
    tokenId: string
    chainId: ChainId
    provider: NonFungibleAssetProvider
    page: number
    size: number
}

export interface CollectionOption {
    address: string
    chainId: ChainId
    provider: NonFungibleAssetProvider
    page: number
    size: number
}

export async function getAsset(options: AssetOption) {
    switch (options.provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSea.getAsset(options.address, options.tokenId, { chainId: options.chainId })
        case NonFungibleAssetProvider.NFTSCAN:
            return
        case NonFungibleAssetProvider.RARIBLE:
            return Rarible.getAsset(options.address, options.tokenId, { chainId: options.chainId })
        default:
            unreachable(options.provider)
    }
}

export async function getOrders(options: OrderOption) {
    const { provider, address, tokenId, side, chainId, page, size } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSea.getOrders(address, tokenId, side, {
                chainId,
                page,
                size,
            })
        case NonFungibleAssetProvider.NFTSCAN:
            return []
        case NonFungibleAssetProvider.RARIBLE:
            return Rarible.getOrders(address, tokenId, side, { chainId })
        default:
            unreachable(provider)
    }
}

export async function getListings(options: ListOption) {
    const { address, tokenId, chainId, provider } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return []
        case NonFungibleAssetProvider.NFTSCAN:
            return []
        case NonFungibleAssetProvider.RARIBLE:
            return Rarible.getListings(address, tokenId, { chainId })
        default:
            unreachable(provider)
    }
}

export async function getHistory(options: HistoryOption) {
    const { address, tokenId, chainId, provider, page, size } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSea.getHistory(address, tokenId, { chainId, page, size })
        case NonFungibleAssetProvider.NFTSCAN:
            return []
        case NonFungibleAssetProvider.RARIBLE:
            return Rarible.getHistory(address, tokenId)
        default:
            unreachable(provider)
    }
}

export async function getCollections(options: CollectionOption) {
    const { address, chainId, provider, page, size } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSea.getCollections(address, { chainId, page, size })
        case NonFungibleAssetProvider.RARIBLE:
            return []
        case NonFungibleAssetProvider.NFTSCAN:
            return []
        default:
            unreachable(provider)
    }
}
