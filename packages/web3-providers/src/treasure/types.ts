/* eslint-disable @typescript-eslint/prefer-enum-initializers */

enum TokenStandard {
    ERC721 = 1,
    ERC1155 = 2,
}

enum TreasureStatus {
    Active = 1,
    Hidden = 2,
    Sold = 3,
}
export interface TreasureToken {
    id: string
    tokenId: string
    floorPrice: string | null
    metadata: TreasureTokenMetadata
    owner: TreasureOwner | null
    lowestPrice: ListingFieldsWithToken[]
    listings: [Listing]
}

export interface TreasureUser {
    id: string
    listings: [Listing]
    tokens: [UserToken]
    address: string
    profile_img_url?: string
    user?: {
        username: string
    }
    link: string
}

export interface Token {
    id: string
    collection: Collection
    _owners: [string]
    filters: [string]
    floorPrice: string
    listings: Listing
    metadata: Metadata
    metaUri: string
    name: string

    owner: TreasureUser
    owners: [UserToken]
    rank: string
    rarity: string
    tokenId: string
    totalItems: string
    totalOwners: string
}

export interface UserToken {
    id: string
    quantity: string
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
    floorPrice: string
    listings: [Listing]
    name: string
    standard: TokenStandard
    symbol: string
    tokens: [Token]
    totalItems: string
    totalListings: string
    totalOwners: string
    totalSales: string
    totalVolume: string
}

export interface Listing {
    id: string
    _listedQuantity: string
    blockTimestamp: string
    buyer: TreasureUser
    collection: Collection
    collectionName: string
    expires: string
    filters: [string]
    nicePrice: string
    pricePerItem: string
    quantity: string
    seller: TreasureUser
    stats: StatsData
    status: TreasureStatus
    token: Token
    tokenName: string
    totalPrice: string
    transactionLink: string
    user: TreasureUser
}

export interface StatsData {
    id: string
    floorPrice: string
    items: string
    listings: string
    sales: string
    volume: string
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
    fee: string
    name: string
    profile_img_url?: string
    address: string
    user?: {
        username: string
    }
    link: string
}
export interface ListingFieldsWithToken {
    seller: {
        id: string
    }
    expires: string
    id: string
    pricePerItem: string
    quantity: string
}

export interface Collections {
    collections: {
        id: string
        name: string
    }[]
}

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
    fee: string
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
        percentage?: string
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
