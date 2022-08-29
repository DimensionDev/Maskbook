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

export interface Creator {
    account: string
    value: number
}

export interface Meta {
    name: string
    description: string
    attributes: Array<{
        key: string
        value: string
    }>
    content?: Array<{
        '@type': string
        width: number
        height: number
        mimeType: string
        representation: string
        size: number
        url: string
    }>
}

export interface Token {
    '@type': string
    contract?: string
    tokenId?: string
}

export interface LastSell {
    buyer: string
    currency: Token
    date: string
    price: string
    seller: string
    value: string
}

export interface RaribleNFTItemMapResponse {
    id: string
    blockchain: string
    collection: string
    contract: string
    tokenId: string
    creators: Creator[]
    lazySupply: string
    pending: RaribleTransferItem[]
    mintedAt: string
    lastUpdatedAt: string
    supply: string
    meta?: Meta
    deleted: boolean
    royalties: Royalty[]
    lastSale?: LastSell
}

export interface Tag {
    name: string
    source: string
}

export interface RaribleCollectibleResponse {
    '@class': string
    id: string
    name: string
    symbol: string
    status: string
    features: RARIBLE_FEATURES[]
    standard: string
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

export interface RaribleOrder {
    id: string
    fill: string
    platform: string
    status: string
    startedAt?: string
    endedAt?: string
    makeStock: string
    cancelled: boolean
    createdAt: string
    lastUpdatedAt: string
    dbUpdatedAt?: string
    makePrice?: string
    takePrice?: string
    makePriceUsd?: string
    takePriceUsd?: string
    maker: string
    taker?: string
    make: {
        type: Token
        value: string
    }
    take: {
        type: Token
        value: string
    }
    salt: string
    signature?: string
    pending: RaribleTransferItem[]
    data: unknown
}

export enum RaribleEventType {
    TRANSFER = 'TRANSFER',
    MINT = 'MINT',
    BURN = 'BURN',
    BID = 'BID',
    LIST = 'LIST',
    SELL = 'SELL',
    CANCEL_LIST = 'CANCEL_LIST',
    CANCEL_BID = 'CANCEL_BID',
    AUCTION_BID = 'AUCTION_BID',
    AUCTION_CREATED = 'AUCTION_CREATED',
    AUCTION_CANCEL = 'AUCTION_CANCEL',
    AUCTION_FINISHED = 'AUCTION_FINISHED',
    AUCTION_STARTED = 'AUCTION_STARTED',
    AUCTION_ENDED = 'AUCTION_ENDED',
}

export interface RaribleHistory {
    '@type': RaribleEventType
    amountUsd: string
    from?: string
    buyer?: string
    buyerOrderHash?: string
    cursor: string
    date: string
    id: string
    contract?: string
    tokenId?: string
    lastUpdatedAt: string
    nft?: {
        type: Token
        value: string
    }
    payment?: {
        type: Token
        value: string
    }
    maker?: string
    make?: {
        type: Token
        value: string
    }
    take?: {
        type: Token
        value: string
    }
    price: string
    priceUsd: string
    reverted: boolean
    owner?: string
    seller?: string
    sellerOrderHash?: string
    source: string
    hash?: string
    transactionHash?: string
    value?: string
    type: string
}
