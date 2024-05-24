interface Creator {
    /** address */
    address: string
    verified: true
    share: number
}
interface Attribute {
    trait_type: string
    value: string
}
interface File {
    uri: string
    type: LiteralUnion<'image/png' | 'video/mp4' | 'image/jpeg'>
}

interface Properties {
    files: File[]
    category: LiteralUnion<'image'>
    creators: Creator[]
}

interface Rarity {
    [key: string]: {
        rank: number
        absolute_rarity?: number
        crawl?: {
            id: string
            first_mint_ts: number
            last_mint_ts: number
            first_mint: string
            last_mint: string
            until_tx: string
            until_slot: number
            expected_pieces: number
            seen_pieces: number
            last_crawl_id: number
            complete: boolean
            blocked: boolean
            unblock_at_ts: number
        }
    }
}

/**
 * /tokens/:token_mint
 */
export interface MagicEdenToken {
    /** address */
    mintAddress: string
    /** address */
    owner: string
    supply: number
    collection: string
    name: string
    updateAuthority: string
    primarySaleHappened: 1
    sellerFeeBasisPoints: 500
    /** image url */
    image: string
    animationUrl: string
    externalUrl: string
    attributes: Attribute[]
    properties: Properties
}

/**
 * tokens/:token_mint/offer_received
 *
 */
interface TokenOffer {
    /** address */
    pdaAddress: string
    /** address */
    tokenMint: string
    auctionHouse: string
    /** address */
    buyer: string
    /** address */
    buyerReferral: string
    tokenSize: number
    price: number
    expiry: number
}

/**
 * /v2/tokens/:token_mint/activities
 *
 */
export interface TokenActivity {
    signature: string
    source: LiteralUnion<'magiceden' | 'magiceden_v2'>
    /** address */
    tokenMint: string
    collectionSymbol: string
    slot: number
    blockTime: number
    buyer?: string
    buyerReferral: string
    /** address */
    seller: string
    sellerReferral: string
    price: number
}

/**
 * - Offer made by a wallet.
 * - offer received by a wallet.
 *
 * /wallets/:wallet_address/offers_made
 * /wallets/:wallet_address/offers_received
 */
export interface WalletOffer extends Omit<TokenOffer, 'buyerReferral'> {
    /** address */
    buyer: string
}

/**
 * Collection
 * /collections
 */
export interface MagicEdenCollection extends CollectionStats {
    name: string
    description: string
    /** url */
    image: string
    twitter: string
    discord: string
    website: string
    isFlagged: boolean
    flagMessage: string
    categories: string[]
    createdAt: string
    updateAt: string
}

export interface MagicEdenNFT {
    id: string
    price: number
    owner: string
    collectionName: string
    collectionTitle: string
    img: string
    title: string
    content: string
    externalURL: string
    propertyCategory: LiteralUnion<'image'>
    creators: Creator[]
    sellerFeeBasisPoints: number
    mintAddress: string
    attributes: Attribute[]
    properties: Properties
    supply: number
    /** address */
    updateAuthority: string
    primarySaleHappened: boolean
    onChainCollection: any
    isTradeable: boolean
    tokenDelegateValid: boolean
    rarity: Rarity
}

/**
 * Stats of a collection
 * /collections/:symbol/stats
 */
interface CollectionStats {
    symbol: string
    floorPrice: number
    listedCount: number
    avgPrice24hr: number
    volumeAll: number
}

interface AuctionBid {
    /** pubkey */
    auctionConfig: string
    timestamp: number
    /** pubkey */
    bid: string
    /** pubkey */
    bidder: string
    bump: number
    escrowBump: number
    amount: number
    notifiable: boolean
    notifiableOutbid: boolean
}

export interface Auction {
    bids: AuctionBid[]
    _id: string
    /** pubkey */
    configId: string
    name: string
    description: string | null
    attributes: Attribute[]
    rarity: Rarity
    source: 'self-service'
    config: {
        bump: number
        /** pubkey */
        authority: number
        minBid: number
        minBidIncrement: number
        /** ISODatetime */
        startDate: string
        /** ISODatetime */
        endDate: string
        /** pubkey */
        tokenAccount: string
        /** pubkey */
        tokenMint: string
        highestBid: number | null
        highestBidAmount: number | null
        /** pubkey */
        highestBidder: string | null
        acceptingBids: boolean
        auctionClosed: boolean
        timeExtension: number
        timeExtensionThreshold: number
        payees: Array<{
            address: string
            share: 0
        }>
    }
    notifiable: boolean
    collectionSymbol: string
    onChainCollectionAddress: string | null
    configVersion: number
    /** ISODatetime */
    updatedAt: string
}
