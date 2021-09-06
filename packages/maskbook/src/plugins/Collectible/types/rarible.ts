import type { WyvernSchemaName } from 'opensea-js/lib/types'

export interface RaribleTransferItem {
    type: string
    from: string
}

export interface Royalty {
    recipient: string
    value: number
}

export interface Attribute {
    key: string
    value: string
}

export interface Salt {
    value: string
    type: string
}

export enum RARIBLE_FEATURES {
    APPROVE_FOR_ALL = 'APPROVE_FOR_ALL',
    SET_URI_PREFIX = 'SET_URI_PREFIX',
    BURN = 'BURN',
    MINT_WITH_ADDRESS = 'MINT_WITH_ADDRESS',
    SECONDARY_SALE_FEES = 'SECONDARY_SALE_FEES',
}

export interface Ownership {
    id: string
    token: string
    tokenId: string
    owner: string
    value: number
    date: Date
    price: number
    priceEth: number
    buyToken: string
    buyTokenId: string
    status: string
    selling: number
    sold: number
    stock: number
    signature: string
    pending: RaribleTransferItem[]
    blacklisted: boolean
    creator: string
    verified: boolean
    categories: string[]
    likes: number
}

export interface Creator {
    account: string
    value: number
}

export interface Meta {
    name: string
    description: string
    attributes: {
        key: string
        value: string
    }[]
    image: {
        meta: {
            PREVIEW: {
                type: string
                width: number
                height: number
            }
        }
        url: {
            BIG: string
            ORIGINAL: string
            PREVIEW: string
        }
        name: string
    }
    animation?: {
        meta: {
            PREVIEW: {
                type: string
                width: number
                height: number
            }
        }
        url: {
            BIG: string
            ORIGINAL: string
            PREVIEW: string
        }
    }
}

export interface RaribleNFTItemMapResponse {
    contract: string
    creators: Creator[]
    date: string
    deleted: boolean
    id: string
    lazySupply: string
    meta: Meta
    owners: string[]
    royalties: Royalty[]
    pending: RaribleTransferItem[]
    supply: string
    tokenId: string
}

export interface RaribleNFTOwnershipResponse extends RaribleNFTItemMapResponse {
    ownership: Ownership
}

export interface Tag {
    name: string
    source: string
}

export interface RaribleCollectibleResponse {
    ['@class']: string
    id: string
    name: string
    symbol: string
    status: string
    features: RARIBLE_FEATURES[]
    standard: WyvernSchemaName
    startBlockNumber: number
    pic: string
    cover: string
    indexable: boolean
    volume: number
    editors: any[]
    tags: Tag[]
    version: number
    description?: string
    shortUrl: string
}

export enum RaribleProfileType {
    USER = 'USER',
    COLLECTION = 'COLLECTION',
}

export interface RaribleProfileResponse {
    blacklisted: boolean
    cover: string
    followers: number
    followings: number
    has3Box: boolean
    id: string
    image: string
    name?: string
    description?: string
    type: RaribleProfileType
}

export interface RaribleOfferResponse {
    token: string
    tokenId: string
    assetType: string
    maker: string
    salt: Salt
    buyValue: number
    buyToken: string
    buyTokenId: string
    buyAssetType: string
    value: number
    signature: string
    updateDate: Date
    importantUpdateDate: Date
    updateStateDate: Date
    contractVersion: number
    fee: number
    sold: number
    canceled: boolean
    pending: RaribleTransferItem[]
    buyPriceEth: number
    version: number
    id: string
    active: boolean
    buyPrice: number
    sellPrice: number
    buyStock: number
}

export interface RaribleOrder extends RaribleOfferResponse {
    ownerInfo: RaribleProfileResponse
}

export enum RaribleEventType {
    ORDER = 'order',
    BUY = 'buy',
    TRANSFER = 'transfer',
    OFFER = 'offer',
}

export interface RaribleHistory {
    '@type': RaribleEventType
    id: string
    owner: string
    value: number
    price: number
    buyToken: string
    buyTokenId: string
    buyer?: string
    from?: string
    date: Date
    transactionHash: string
}
