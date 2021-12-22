import { ChainId, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'

import { unreachable } from '@dimensiondev/kit'
import { NFTScanAPI, OpenSeaAPI, RaribleAPI } from '@masknet/web3-providers'
import type { OrderSide } from '@masknet/web3-providers'

export interface AssetOption {
    address: string
    tokenId: string
    chainId: ChainId
    provider: NonFungibleAssetProvider
}

export interface OrderOption {
    address: string
    tokenId: string
    side: OrderSide
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
            return OpenSeaAPI.getAsset(options.address, options.tokenId, options.chainId)
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanAPI.getAsset(options.address, options.tokenId, options.chainId)
        case NonFungibleAssetProvider.RARIBLE:
            return RaribleAPI.getAsset(options.address, options.tokenId, options.chainId)
        default:
            unreachable(options.provider)
    }
}

export async function getOrders(options: OrderOption) {
    const { provider, address, tokenId, side, chainId, page, size } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSeaAPI.getOrders(address, tokenId, side, chainId, page, size)
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanAPI.getOrders(address, tokenId, side, chainId)
        case NonFungibleAssetProvider.RARIBLE:
            return RaribleAPI.getOrders(address, tokenId, side, chainId)
        default:
            unreachable(provider)
    }
}

export async function getListings(options: ListOption) {
    const { address, tokenId, chainId, provider } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSeaAPI.getListings(address, tokenId, chainId)
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanAPI.getListings(address, tokenId, chainId)
        case NonFungibleAssetProvider.RARIBLE:
            return RaribleAPI.getListings(address, tokenId, chainId)
        default:
            unreachable(provider)
    }
}

export async function getHistory(options: HistoryOption) {
    const { address, tokenId, chainId, provider, page, size } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSeaAPI.getHistory(address, tokenId, chainId, page, size)
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanAPI.getHistory(address, tokenId, chainId)
        case NonFungibleAssetProvider.RARIBLE:
            return RaribleAPI.getHistory(address, tokenId)
        default:
            unreachable(provider)
    }
}

export async function getCollections(options: CollectionOption) {
    const { address, chainId, provider, page, size } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSeaAPI.getCollections(address, { chainId, page, size })
        case NonFungibleAssetProvider.RARIBLE:
            return []
        case NonFungibleAssetProvider.NFTSCAN:
            return []
        default:
            unreachable(provider)
    }
}
