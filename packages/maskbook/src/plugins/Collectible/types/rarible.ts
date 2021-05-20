import type { WyvernSchemaName } from 'opensea-js/lib/types'

export interface RaribleTransferItem {
    date: string
    owner: string
    from: string
    token: string
    tokenId: string
    value: number
    type: string
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

export enum RARIBLEFEATURES {
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

export interface RaribleNFTItemMapResponse {
    item: {
        id: string
        token: string
        tokenId: string
        unlockable: boolean
        creator: string
        blacklisted: boolean
        supply: number
        royalties: Royalty[]
        likes: number
        categories: string[]
        verified: boolean
        owners: string[]
        sellers: number
        ownership: Ownership
        totalStock: number
        offer?: RaribleOfferResponse
    }
    properties: {
        name: string
        description: string
        image: string
        imagePreview?: string
        imageBig: string
        animationUrl?: string
        attributes: Attribute[]
    }
    meta: {
        imageMeta: {
            type: string
            width: number
            height: number
        }
    }
    id: string
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
    features: RARIBLEFEATURES[]
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
    owner: string
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
    BUY = 'BUY',
    TRANSFER = 'transfer',
    OFFER = 'OFFER',
}

export interface RaribleHistory {
    '@type': RaribleEventType
    owner: string
    value: number
    price: number
    buyToken: string
    buyTokenId: string
    buyer?: string
    from?: string
    date: Date
    transactionHash: string
    salt: string
}
