import type { OpenSeaFungibleToken, WyvernSchemaName } from 'opensea-js/lib/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { OpenSeaAssetEventType } from './opensea'
import type { RaribleEventType } from './rarible'

export * from './opensea'
export * from './rarible'

export interface CollectibleJSON_Payload {
    chain_id: ChainId
    address: string
    token_id: string
}

export enum CollectibleTab {
    ARTICLE = 0,
    TOKEN = 1,
    OFFER = 2,
    LISTING = 3,
    HISTORY = 4,
}

export interface CollectibleToken {
    chainId: ChainId
    tokenId: string
    contractAddress: string
    schemaName?: WyvernSchemaName
}

export enum CollectibleProvider {
    OPENSEA = 0,
    RARIBLE = 1,
}

export interface NFTAsset {
    imageUrl: string
    assetContract: {
        name: string
        description: string
        schemaName: WyvernSchemaName
    }
    currentPrice?: number
    owner?: {
        address: string
        profile_img_url?: string
        user?: {
            username: string
        }
    }
    creator?: {
        address: string
        profile_img_url?: string
        user?: {
            username: string
        }
    }
    traits?: { trait_type: string; value: string }[]
    safelist_request_status: string
    description: string
    name?: string
    animation_url?: string
}

export interface NFTOrder {
    unitPrice: number
    usdPrice?: number
    makerAccount: {
        user?: {
            username?: string
        }
        address?: string
        profile_img_url: string
        link: string
    }
    hash?: string
    quantity?: number
    expirationTime?: string
    paymentTokenContract?: OpenSeaFungibleToken
    paymentToken?: string
}

export interface NFTHistory {
    id: string
    accountPair: {
        from?: {
            username?: string
            address?: string
            imageUrl?: string
            link: string
        }
        to?: {
            username?: string
            address?: string
            imageUrl?: string
            link: string
        }
    }
    price?: {
        quantity: string
        price: string
        asset?: {
            id: string
            decimals: number
            image_url: string
            image_original_url: string
            image_preview_url: string
            asset_contract: {
                symbol: string
            }
            permalink: string
        }
        paymentToken?: OpenSeaFungibleToken
    }

    eventType: OpenSeaAssetEventType | RaribleEventType
    transactionBlockExplorerLink?: string
    timestamp: number
}
