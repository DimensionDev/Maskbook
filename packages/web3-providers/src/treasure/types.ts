/* eslint-disable @typescript-eslint/prefer-enum-initializers */

enum TokenStandard {
    ERC721,
    ERC1155,
}

enum TreasureStatus {
    Active,
    Hidden,
    Sold,
}
export interface TreasureToken {
    id: string
    tokenId: string
    floorPrice: number | null
    metadata: TreasureTokenMetadata
    owner: TreasureOwner | null
    lowestPrice: ListingFieldsWithToken[]
    listings: [Listing]
}

export interface TreasureUser {
    id: string
    listings: [Listing]
    tokens: [UserToken]
}

export interface Token {
    id: string
    collection: Collection
    _owners: [string]
    filters: [string]
    floorPrice: number
    listings: Listing
    metadata: Metadata
    metaUri: string
    name: string

    owner: TreasureUser
    owners: [UserToken]
    rank: number
    rarity: number
    tokenId: string
    totalItems: number
    totalOwners: number
}

export interface UserToken {
    id: string
    quantity: number
    token: Token
    user: TreasureUser
}
export interface Metadata {
    id: string
    attribute: [MetadataAttribute]
    description: string
    image: string
    name: string
    token: Token
}

export interface MetadataAttribute {
    id: string
    attribute: Attribute
    metadata: Metadata
}
export interface Attribute {
    id: string
    _tokenIds: [string]
    collection: Collection
    metadata: [MetadataAttribute]
}
export interface Collection {
    id: string
    _attributeIds: [string]
    _listingIds: [string]
    _owners: [string]
    _tokenIds: [string]
    address: string
    attributes: Attribute
    creator: Creator
    floorPrice: number
    listings: [Listing]
    name: string
    standard: TokenStandard
    symbol: string
    tokens: [Token]
    totalItems: number
    totalListings: number
    totalOwners: number
    totalSales: number
    totalVolume: number
}

export interface Listing {
    id: string
    _listedQuantity: number
    blockTimestamp: number
    buyer: TreasureUser
    collection: Collection
    collectionName: string
    expires: number
    filters: [string]
    nicePrice: string
    pricePerItem: number
    quantity: number
    seller: TreasureUser
    status: TreasureStatus
    token: Token
    tokenName: string
    totalPrice: string
    transactionLink: string
    user: TreasureUser
}
export interface Exerciser {
    id: string
}
export interface Student {
    id: string
}

export interface Creator {
    id: string
    collections: Collection
    fee: number
    name: string
}
export interface ListingFieldsWithToken {
    seller: {
        id: string
    }
    expires: string
    id: string
    pricePerItem: string
    quantity: number
}

export interface Collections {
    collections: {
        id: string
        name: string
    }[]
}

export interface TokenMetadata {
    json: MetadataInfo
}

export interface MetadataInfo {
    animation_url: string
    image_url: string
    created_by: string
    attributes: TokenAttributes[]
    name: string
    description: string
    image: string
}

export interface TokenContract {
    name: string
}

export interface TokenAttributes {
    trait_type: string
    value: string
}

// Treasure Types

export type CollectionItem = {
    name: string
    address: string
}

export interface TreasureTokenDetail {
    collection: {
        id: string
        name: string
        creator?: TreasureCreator
        standard: string
        tokens: TreasureToken[]
    }
}

export interface TreasureCreator {
    id: string
    name: string
    fee: number
}

export interface TreasureOwner {
    id: string
    address: string
    profile_img_url?: string
    user?: {
        username: string
    }
    link: string
}

export interface TreasureAttribute {
    attribute: {
        id?: string
        name: string
        percentage?: number
        value: string
    }
}

interface TreasureTokenMetadata {
    attributes?: TreasureAttribute[]
    description: string
    image: string
    name: string
    metadata?: Record<string, any>
}

export interface TreasureTokenWithMetadata {
    token: TreasureTokenMetadata
}
