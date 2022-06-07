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
    type: 'image/png' | 'video/mp4' | 'image/jpeg' | string
}

interface Properties {
    files: File[]
    category: 'image' | string
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
 * /tokens/:token_mint/listings
 */
export interface TokenInListings {
    /** address */
    pdaAddress: string
    auctionHouse: string
    /** address */
    tokenAddress: string
    /** address */
    tokenMint: string
    /** address */
    seller: string
    tokenSize: number
    price: number
}

/**
 * tokens/:token_mint/offer_received
 *
 */
export interface TokenOffer {
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
    source: 'magiceden' | 'magiceden_v2' | string
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
 * /wallets/:wallet_address/tokens
 * Token owned by a wallet.
 */
export interface WalletToken extends Omit<MagicEdenToken, 'animationUrl'> {
    /** Either "listed", "unlisted" or "both". Default "both". */
    listStatus: 'listed' | 'unlisted' | 'both'
}

/**
 * Activity of a wallet.
 * /wallets/:wallet_address/activities
 */
export interface WalletActivity extends Omit<TokenActivity, 'collectionSymbol'> {
    type: 'buyNow' | string
    collection: string
    /** address */
    buyer: string
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
 * Escrow balance for a wallet.
 * /wallets/:wallet_address/escrow_balance
 */
export interface WalletEscrowBalance {
    /** address */
    buyerEscrow: string
    balance: 0.03
}

/**
 * Escrow balance for a wallet.
 * /wallets/:wallet_address
 */
export interface WalletAddress {
    displayName: string
    /** mint address of NFT */
    avatar: string
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
    collectionTittle: string
    img: string
    title: string
    content: string
    externalURL: string
    propertyCategory: 'image' | string
    creators: Creator[]
    sellerFeeBasisPoints: number
    mintAddress: string
    attributes: Attribute[]
    properties: Properties
    supply: number
    /** address */
    updateAuthority: string
    primarySaleHappened: boolean
    onChainCollection: {}
    isTradeable: boolean
    tokenDelegateValid: boolean
    rarity: Rarity
}

/**
 * Collection in listings
 * /collections/:symbol/listings
 */
export interface CollectionInListings extends TokenInListings {}

/**
 * Activity of a collection
 * /collections/:symbol/activities
 */
export interface CollectionActivity extends TokenActivity {
    type: 'cancelBid'
}

/**
 * Stats of a collection
 * /collections/:symbol/stats
 */
export interface CollectionStats {
    symbol: string
    floorPrice: number
    listedCount: number
    avgPrice24hr: number
    volumeAll: number
}

/**
 * launchpad collections
 * /launchpad/collections
 */
export interface LaunchpadCollection
    extends Omit<MagicEdenCollection, 'twitter' | 'discord' | 'website' | 'categories'> {
    featured: boolean
    edition: string
    price: number
    size: number
    /** ISODatetime */
    launchDatetime: string
}

/**
 * - Instruction to buy(bid) on a NFT
 *   /instructions/buy
 * - Instruction to buy on a NFT now for the listed price
 *   /instructions/buy_now
 * - Instruction to cancel a buy(bid)
 *   /instructions/buy_cancel
 * - Instruction to change a buy (bid) price
 *   /instructions/buy_change_price
 * - Instruction to sell (list)
 *   /instructions/sell
 * - Instruction to sell now (accept offer)
 *   /instructions/sell_now
 * - Instruction to cancel a sell (list)
 *   /instructions/sell_cancel
 * - Instruction to change a sell (list) price
 *   /instructions/sell_change_price
 * - Instruction to deposit to escrow
 *   /instructions/deposit
 * - Instruction to withdraw from escrow
 *   /instructions/withdraw
 */
export interface Instruction {
    tx: {
        type: 'Buffer'
        data: number[]
    }
    txSigned: {
        type: 'Buffer'
        data: number[]
    }
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
