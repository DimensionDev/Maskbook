import type { OpenSeaFungibleToken, WyvernSchemaName } from 'opensea-js/lib/types'

export * from './opensea'
export * from './rarible'
export interface CollectibleJSON_Payload {
    address: string
    token_id: string
}

export interface CollectibleToken {
    contractAddress: string
    tokenId: string
    // schemaName: WyvernSchemaName
}

export enum CollectibleProvider {
    OPENSEA,
    RARIBLE,
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
