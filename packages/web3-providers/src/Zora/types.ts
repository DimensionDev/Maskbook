/* cspell:disable */

interface CurrencyAmount {
    currency: {
        name: string
        address: string
        decimals: string
    }
    raw: string
    decimal: number
}

interface PriceAtTime {
    nativePrice: CurrencyAmount
    chainTokenPrice?: CurrencyAmount
    usdcPrice?: CurrencyAmount
    blockNumber: number
}

interface Network {
    network: 'ETHEREUM'
    chain: 'MAINNET' | 'GOERLI' | 'RINKEBY'
}

interface Transaction {
    blockNumber: number
    // e.g., 2021-09-07T11:48:32+00:00
    blockTimestamp: string
    transactionHash?: string
    logIndex?: number
}

interface Media {
    url?: string
    mimeType?: string
    size?: string
}

interface Attribute {
    value?: string
    traitType?: string
    displayType?: string
}

interface CollectionAttribute {
    traitType?: string
    valueMetrics: Array<{
        value: string
        count: string
        percent: string
    }>
}

export interface Token<T = unknown> {
    collectionAddress: string
    collectionName?: string
    tokenId: string
    mintInfo?: {
        mintContext: Transaction
        originatorAddress: string
        toAddress: string
        price: PriceAtTime
    }
    networkInfo: Network
    tokenUrl?: string
    tokenUrlMimeType?: string
    content?: Media
    image?: Media
    owner?: string
    tokenContract?: {
        chain: number
        name?: string
        symbol?: string
        description?: string
        totalSupply?: number
        network?: string
        collectionAddress: string
    }
    name?: string
    description?: string
    metadata?: T
    attributes?: Attribute[]
    lastRefreshTime?: string
}

export interface Collection {
    name?: string
    description: string
    entityTitle: string
    collectionAddress: string
    entity: {
        address: string
        description: string
        name: string
        symbol: string
        totalSupply?: number
        networkInfo: Network
        attributes: CollectionAttribute[]
    }
}

export enum EventType {
    APPROVAL_EVENT = 'APPROVAL_EVENT',
    LIL_NOUNS_AUCTION_EVENT = 'LIL_NOUNS_AUCTION_EVENT',
    NOUNS_AUCTION_EVENT = 'NOUNS_AUCTION_EVENT',
    SALE_EVENT = 'SALE_EVENT',
    SEAPORT_EVENT = 'SEAPORT_EVENT',
    MINT_EVENT = 'MINT_EVENT',
    TRANSFER_EVENT = 'TRANSFER_EVENT',
    V1_MARKET_EVENT = 'V1_MARKET_EVENT',
    V2_AUCTION_EVENT = 'V2_AUCTION_EVENT',
    V3_ASK_EVENT = 'V3_ASK_EVENT',
    V3_RESERVE_AUCTION_EVENT = 'V3_RESERVE_AUCTION_EVENT',
}

enum SaleType {
    FOUNDATION_SALE = 'FOUNDATION_SALE',
    NOUNS_AUCTION_SALE = 'NOUNS_AUCTION_SALE',
    LIL_NOUNS_AUCTION_SALE = 'LIL_NOUNS_AUCTION_SALE',
    CRYPTOPUNKS_SALE = 'CRYPTOPUNKS_SALE',
    LOOKS_RARE_SALE = 'LOOKS_RARE_SALE',
    OPENSEA_SINGLE_SALE = 'OPENSEA_SINGLE_SALE',
    OPENSEA_BUNDLE_SALE = 'OPENSEA_BUNDLE_SALE',
    RARIBLE_SALE = 'RARIBLE_SALE',
    SEAPORT_SALE = 'SEAPORT_SALE',
    SUPERRARE_SALE = 'SUPERRARE_SALE',
    ZEROX_SALE = 'ZEROX_SALE',
    ZORA_V2_AUCTION_SALE = 'ZORA_V2_AUCTION_SALE',
    ZORA_V3_ASK_SALE = 'ZORA_V3_ASK_SALE',
}

export interface MintEventProperty {
    tokenId: string
    collectionAddress: string
    originatorAddress: string
    toAddress: string
    price: PriceAtTime
}

export interface SaleEventProperty {
    saleContractAddress?: string
    transactionInfo: Transaction
    networkInfo: Network
    buyerAddress: string
    collectionAddress: string
    saleType: SaleType
    price: PriceAtTime
    sellerAddress: string
    tokenId: string
}

export interface TransferEventProperty {
    fromAddress: string
    toAddress: string
}

export interface Event<T = unknown> {
    networkInfo: Network
    transactionInfo: Transaction
    eventType: EventType
    collectionAddress?: string
    tokenId?: string
    properties?: T
}
