import { unreachable } from '@dimensiondev/kit'
import { ChainId, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { NonFungibleTokenAPI, OpenSea, Rarible, Zora, LooksRare } from '@masknet/web3-providers'

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

const defaultPageableData = {
    data: [],
    hasNextPage: false,
}

export async function getAsset(options: AssetOption) {
    switch (options.provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSea.getAsset(options.address, options.tokenId, { chainId: options.chainId })
        case NonFungibleAssetProvider.NFTSCAN:
            return
        case NonFungibleAssetProvider.RARIBLE:
            return Rarible.getAsset(options.address, options.tokenId, { chainId: options.chainId })
        case NonFungibleAssetProvider.ZORA:
            return Zora.getAsset(options.address, options.tokenId)
        case NonFungibleAssetProvider.LOOKSRARE:
            return LooksRare.getAsset(options.address, options.tokenId)
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
        case NonFungibleAssetProvider.ZORA:
            return Zora.getOrders(address, tokenId, side)
        case NonFungibleAssetProvider.LOOKSRARE:
            return LooksRare.getOrders(address, tokenId, side)
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
        case NonFungibleAssetProvider.ZORA:
            return Zora.getListings(address, tokenId)
        case NonFungibleAssetProvider.LOOKSRARE:
            return Zora.getListings(address, tokenId)
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
        case NonFungibleAssetProvider.ZORA:
            return Zora.getHistory(address, tokenId)
        case NonFungibleAssetProvider.LOOKSRARE:
            return LooksRare.getHistory(address, tokenId)
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
            return defaultPageableData
        case NonFungibleAssetProvider.NFTSCAN:
            return defaultPageableData
        case NonFungibleAssetProvider.ZORA:
            return defaultPageableData
        case NonFungibleAssetProvider.LOOKSRARE:
            return defaultPageableData
        default:
            unreachable(provider)
    }
}
