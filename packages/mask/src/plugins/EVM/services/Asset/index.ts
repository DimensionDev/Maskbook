import { ChainId, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'

import { unreachable } from '@dimensiondev/kit'
import { NFTScanApi, OpenSeaApi, RaribleApi } from '@masknet/web3-providers'
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

export interface HistoryOtpion {
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
            return OpenSeaApi.getAsset(options.address, options.tokenId, options.chainId)
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanApi.getAsset(options.address, options.tokenId, options.chainId)
        case NonFungibleAssetProvider.RARIBLE:
            return RaribleApi.getAsset(options.address, options.tokenId, options.chainId)
        default:
            unreachable(options.provider)
    }
}

export async function getOrders(options: OrderOption) {
    const { provider, address, tokenId, side, chainId, page, size } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSeaApi.getOrders(address, tokenId, side, chainId, page, size)
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanApi.getOrders(address, tokenId, side, chainId)
        case NonFungibleAssetProvider.RARIBLE:
            return RaribleApi.getOrders(address, tokenId, side, chainId)
        default:
            unreachable(provider)
    }
}

export async function getListings(options: ListOption) {
    const { address, tokenId, chainId, provider } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSeaApi.getListings(address, tokenId, chainId)
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanApi.getListings(address, tokenId, chainId)
        case NonFungibleAssetProvider.RARIBLE:
            return RaribleApi.getListings(address, tokenId, chainId)
        default:
            unreachable(provider)
    }
}

export async function getHistory(options: HistoryOtpion) {
    const { address, tokenId, chainId, provider, page, size } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSeaApi.getHistory(address, tokenId, chainId, page, size)
        case NonFungibleAssetProvider.NFTSCAN:
            return NFTScanApi.getHistory(address, tokenId, chainId)
        case NonFungibleAssetProvider.RARIBLE:
            return RaribleApi.getHistory(address, tokenId)
        default:
            unreachable(provider)
    }
}

export async function getCollections(options: CollectionOption) {
    const { address, chainId, provider, page, size } = options
    switch (provider) {
        case NonFungibleAssetProvider.OPENSEA:
            return OpenSeaApi.getCollections(address, { chainId, page, size })
        case NonFungibleAssetProvider.RARIBLE:
            return []
        case NonFungibleAssetProvider.NFTSCAN:
            return []
        default:
            unreachable(provider)
    }
}
