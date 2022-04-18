export interface ZoraHistory {
    blockTimestamp: string
    transaction: ZoraTransactionEvent
}

export interface ZoraTransactionEvent {
    mediaMints?: MediaMint[]
    auctionCreatedEvents?: AuctionCreatedEvent[]
    marketBidEvents?: MarketBidEvent[]
    auctionEndedEvents?: AuctionEndedEvent[]
}

export interface MediaMint {
    id: string
    blockTimestamp: string
    creator: string
    address: string
}

export interface AuctionCreatedEvent {
    id: string
    blockTimestamp: string
    reservePrice: string
    auctionCurrency: string
    tokenOwner: string
    transactionHash: string
}

export interface MarketBidEvent {
    id: string
    blockTimestamp: string
    amount: string
    currencyAddress: string
    bidder: string
    recipient: string
    transactionHash: string
}

export interface AuctionEndedEvent {
    id: string
    tokenOwner: string
    winner: string
    blockTimestamp: string
    auction: AuctionInfo
}

export interface AuctionInfo {
    lastBidAmount: string
    auctionCurrency: string
    expiresAt: string
}

export interface ZoraBid {
    transaction: ZoraTransactionEvent
}

export interface ZoraAsk {
    transaction: ZoraTransactionEvent
}

export interface TreasureToken {
    id: string
    tokenId: string
    floorPrice: number | null
    metadata: TreasureTokenMetadata
    owner: TreasureOwner | null
    lowestPrice: ListingFieldsWithToken[]
    listings: {
        id: string
        status: 'Active' | 'Sold' // TODO: Are there other status?
        buyer: {
            id: string
        } | null
        pricePerItem: string
        seller: {
            id: string
        }
        blockTimestamp: string
    }[]
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

export interface V3TokenAsk {
    askPrice: string
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

export interface Asset {
    id: string
    collection: Collection
    _owners: ![!string]
    filters: ![!string]
    floorPrice: bigint
    listings: [!Listing]
    metadata: Metadata
    metadataUri: string
    name: string

    owner: User

    owners: [!UserToken]
    rank: number
    rarity: number
    tokenId: number

    totalItems: number

    totalOwners: number
}
