import type { OpenSeaPort } from 'opensea-js'
import type { OpenSeaAccount, OpenSeaAsset, OpenSeaCollection, OpenSeaFungibleToken } from 'opensea-js/lib/types'

export type CreateSellOrderPayload = Parameters<OpenSeaPort['createSellOrder']>[0]

export interface OpenSeaCustomTrait {
    trait_type: string
    value: string
}

export interface OpenSeaCustomAccount extends OpenSeaAccount {
    profile_img_url: string
}

export interface OpenSeaCustomCollection extends OpenSeaCollection {
    safelist_request_status: string
    payment_tokens: OpenSeaFungibleToken[]
    slug: string
}

export interface OpenSeaResponse extends OpenSeaAsset {
    animation_url: string
    owner: OpenSeaCustomAccount
    collection: OpenSeaCustomCollection
    creator?: OpenSeaCustomAccount
    traits: OpenSeaCustomTrait[]
    endTime?: string
    top_ownerships: {
        owner: OpenSeaCustomAccount
        quantity: string
    }[]
}

export interface OpenSeaAssetEventAccount {
    address: string
    chain: {
        identifier: string
        id: string
    }
    user: {
        publicUsername: string
        id: string
    }
    imageUrl: string
    id: string
}

export enum OpenSeaAssetEventType {
    CREATED = 'CREATED',
    SUCCESSFUL = 'SUCCESSFUL',
    CANCELLED = 'CANCELLED',
    OFFER_ENTERED = 'OFFER_ENTERED',
    BID_ENTERED = 'BID_ENTERED',
    BID_WITHDRAWN = 'BID_WITHDRAWN',
    TRANSFER = 'TRANSFER',
    APPROVE = 'APPROVE',
    COMPOSITION_CREATED = 'COMPOSITION_CREATED',
    CUSTOM = 'CUSTOM',
    PAYOUT = 'PAYOUT',
}

export interface OpenSeaAssetEvent {
    cursor: string
    node: {
        id: string
        eventType: OpenSeaAssetEventType
        fromAccount?: OpenSeaAssetEventAccount
        toAccount?: OpenSeaAssetEventAccount
        seller?: OpenSeaAssetEventAccount
        winnerAccount?: OpenSeaAssetEventAccount
        price?: {
            quantity: string
            id: string
            asset: {
                decimals: number
                imageUrl: string
                symbol: string
                usdSpotPrice: number
                assetContract: {
                    blockExplorerLink: string
                    id: string
                }
            }
        }
        transaction?: {
            blockExplorerLink: string
            id: string
        }
        assetQuantity: {
            asset: {
                decimals?: number
                id: string
            }
            quantity: string
            id: string
        }
        eventTimestamp: string
    }
}

export interface OpenSeaAssetEventResponse {
    pageInfo: {
        hasNextPage: boolean
        endCursor: string
    }
    edges: OpenSeaAssetEvent[]
}
