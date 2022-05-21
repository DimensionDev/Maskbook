import type { NonFungibleTokenTrait } from '@masknet/web3-shared-base'

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

export interface ZoraToken {
    tokenId: string
    name: string
    address: string
    currentAuction: AuctionInfo
    metadata: TokenMetadata
    tokenContract: TokenContract
    v3Ask: V3TokenAsk
    symbol: string
    owner: string
}

export interface TokenMetadata {
    json: MetadataInfo
}

export interface MetadataInfo {
    animation_url: string
    image_url: string
    created_by: string
    attributes: NonFungibleTokenTrait[]
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
