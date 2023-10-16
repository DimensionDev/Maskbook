/* cspell:disable */
interface Page {
    limit: number
    endCursor?: string
    hasNextPage: boolean
}

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

enum ApprovalEventType {
    APPROVAL = 'APPROVAL',
    APPROVAL_FOR_ALL = 'APPROVAL_FOR_ALL',
}

enum LilNounsAuctionEventType {
    LIL_NOUNS_AUCTION_HOUSE_AUCTION_CREATED_EVENT = 'LIL_NOUNS_AUCTION_HOUSE_AUCTION_CREATED_EVENT',
    LIL_NOUNS_AUCTION_HOUSE_AUCTION_BID_EVENT = 'LIL_NOUNS_AUCTION_HOUSE_AUCTION_BID_EVENT',
    LIL_NOUNS_AUCTION_HOUSE_AUCTION_EXTENDED_EVENT = 'LIL_NOUNS_AUCTION_HOUSE_AUCTION_EXTENDED_EVENT',
    LIL_NOUNS_AUCTION_HOUSE_AUCTION_SETTLED_EVENT = 'LIL_NOUNS_AUCTION_HOUSE_AUCTION_SETTLED_EVENT',
    LIL_NOUNS_AUCTION_HOUSE_AUCTION_TIME_BUFFER_UPDATED_EVENT = 'LIL_NOUNS_AUCTION_HOUSE_AUCTION_TIME_BUFFER_UPDATED_EVENT',
    LIL_NOUNS_AUCTION_HOUSE_AUCTION_RESERVE_PRICE_UPDATED_EVENT = 'LIL_NOUNS_AUCTION_HOUSE_AUCTION_RESERVE_PRICE_UPDATED_EVENT',
    LIL_NOUNS_AUCTION_HOUSE_AUCTION_MIN_BID_INCREMENT_PERCENTAGE_UPDATED = 'LIL_NOUNS_AUCTION_HOUSE_AUCTION_MIN_BID_INCREMENT_PERCENTAGE_UPDATED',
}

enum NounsAuctionEventType {
    NOUNS_AUCTION_HOUSE_AUCTION_CREATED_EVENT = 'NOUNS_AUCTION_HOUSE_AUCTION_CREATED_EVENT',
    NOUNS_AUCTION_HOUSE_AUCTION_BID_EVENT = 'NOUNS_AUCTION_HOUSE_AUCTION_BID_EVENT',
    NOUNS_AUCTION_HOUSE_AUCTION_EXTENDED_EVENT = 'NOUNS_AUCTION_HOUSE_AUCTION_EXTENDED_EVENT',
    NOUNS_AUCTION_HOUSE_AUCTION_SETTLED_EVENT = 'NOUNS_AUCTION_HOUSE_AUCTION_SETTLED_EVENT',
    NOUNS_AUCTION_HOUSE_AUCTION_TIME_BUFFER_UPDATED_EVENT = 'NOUNS_AUCTION_HOUSE_AUCTION_TIME_BUFFER_UPDATED_EVENT',
    NOUNS_AUCTION_HOUSE_AUCTION_RESERVE_PRICE_UPDATED_EVENT = 'NOUNS_AUCTION_HOUSE_AUCTION_RESERVE_PRICE_UPDATED_EVENT',
    NOUNS_AUCTION_HOUSE_AUCTION_MIN_BID_INCREMENT_PERCENTAGE_UPDATED = 'NOUNS_AUCTION_HOUSE_AUCTION_MIN_BID_INCREMENT_PERCENTAGE_UPDATED',
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

enum SeaportEventType {
    SEAPORT_COUNTER_INCREMENTED_EVENT = 'SEAPORT_COUNTER_INCREMENTED_EVENT',
    SEAPORT_ORDER_CANCELLED_EVENT = 'SEAPORT_ORDER_CANCELLED_EVENT',
    SEAPORT_ORDER_FULFILLED_EVENT = 'SEAPORT_ORDER_FULFILLED_EVENT',
    SEAPORT_ORDER_VALIDATED_EVENT = 'SEAPORT_ORDER_VALIDATED_EVENT',
}

enum V1MarketEventType {
    V1_MARKET_BID_CREATED = 'V1_MARKET_BID_CREATED',
    V1_MARKET_BID_REMOVED = 'V1_MARKET_BID_REMOVED',
    V1_MARKET_BID_FINALIZED = 'V1_MARKET_BID_FINALIZED',
    V1_MARKET_ASK_CREATED = 'V1_MARKET_ASK_CREATED',
    V1_MARKET_ASK_REMOVED = 'V1_MARKET_ASK_REMOVED',
    V1_MARKET_BID_SHARE_UPDATED = 'V1_MARKET_BID_SHARE_UPDATED',
}

enum V2AuctionEventType {
    V2_AUCTION_CREATED = 'V2_AUCTION_CREATED',
    V2_AUCTION_CANCELED = 'V2_AUCTION_CANCELED',
    V2_AUCTION_RESERVE_PRICE_UPDATED = 'V2_AUCTION_RESERVE_PRICE_UPDATED',
    V2_AUCTION_BID = 'V2_AUCTION_BID',
    V2_AUCTION_DURATION_EXTENDED = 'V2_AUCTION_DURATION_EXTENDED',
    V2_AUCTION_APPROVAL_UPDATED = 'V2_AUCTION_APPROVAL_UPDATED',
    V2_AUCTION_ENDED = 'V2_AUCTION_ENDED',
}

enum V3AskEventType {
    V3_ASK_CREATED = 'V3_ASK_CREATED',
    V3_ASK_CANCELED = 'V3_ASK_CANCELED',
    V3_ASK_PRICE_UPDATED = 'V3_ASK_PRICE_UPDATED',
    V3_ASK_FILLED = 'V3_ASK_FILLED',
    V3_PRIVATE_ASK_CREATED = 'V3_PRIVATE_ASK_CREATED',
    V3_PRIVATE_ASK_CANCELED = 'V3_PRIVATE_ASK_CANCELED',
    V3_PRIVATE_ASK_PRICE_UPDATED = 'V3_PRIVATE_ASK_PRICE_UPDATED',
    V3_PRIVATE_ASK_FILLED = 'V3_PRIVATE_ASK_FILLED',
}

enum V3ReserveAuctionEventType {
    V3_RESERVE_AUCTION_CREATED = 'V3_RESERVE_AUCTION_CREATED',
    V3_RESERVE_AUCTION_CANCELED = 'V3_RESERVE_AUCTION_CANCELED',
    V3_RESERVE_AUCTION_RESERVE_PRICE_UPDATED = 'V3_RESERVE_AUCTION_RESERVE_PRICE_UPDATED',
    V3_RESERVE_AUCTION_BID = 'V3_RESERVE_AUCTION_BID',
    V3_RESERVE_AUCTION_ENDED = 'V3_RESERVE_AUCTION_ENDED',
}

interface ApprovalEventProperty {
    approvalEventType: ApprovalEventType
    collectionAddress: string
    ownerAddress: string
    approvedAddress: string
    tokenid?: string
    approved?: boolean
}

interface LilNounsAuctionEventProperty<T = unknown> {
    lilNounsAuctionEventType: LilNounsAuctionEventType
    address: string
    properties: T[]
}

export interface MintEventProperty {
    tokenId: string
    collectionAddress: string
    originatorAddress: string
    toAddress: string
    price: PriceAtTime
}

interface NounsAuctionEventProperty<T = unknown> {
    nounsAuctionEventType: NounsAuctionEventType
    address: string
    properties: T[]
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

interface SeaportEventProperty<T = unknown> {
    address: string
    eventType: SeaportEventType
    offerer: string
    orderHash?: string
    zone?: string
    properties?: T[]
}

export interface TransferEventProperty {
    fromAddress: string
    toAddress: string
}

interface V1MarketEventProperty<T = unknown> {
    v1MarketEventType: V1MarketEventType
    address: string
    properties: T
}

interface V2AuctionEventProperty<T = unknown> {
    v2AuctionEventType: V2AuctionEventType
    address: string
    auctionId: number
    properties: T
}

interface V3AskEventProperty<T = unknown> {
    v3AskEventType: V3AskEventType
    address: string
    // only for V3_ASK_CREATED
    properties: {
        seller: string
        sellerFundsRecipient: string
        askCurrency: string
        askPrice: string
        findersFeeBps: number
        price: PriceAtTime
    }
}

interface V3ReserveAuctionEventProperty<T = unknown> {
    eventType: V3ReserveAuctionEventType
    address: string
    tokenContract: string
    tokenId: string
    properties: T
}

export interface Event<T = unknown> {
    networkInfo: Network
    transactionInfo: Transaction
    eventType: EventType
    collectionAddress?: string
    tokenId?: string
    properties?: T
}
