/**
 * /tokens/:token_mint
 */
export interface Token {
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
    attributes: Array<{
        trait_type: string
        value: string
    }>
    properties: {
        files: Array<{
            uri: string
            type: 'image/png' | 'video/mp4' | 'image/jpeg' | string
        }>
        category: string
        creators: Array<{
            /** address */
            address: string
            verified: true
            share: number
        }>
    }
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
 * /tokens/:token_mint/activities
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
    buyerReferral: string
    /** address */
    seller: string
    sellerReferral: string
    price: number
}

/**
 * /tokens/:token_mint/activities
 * Token owned by a wallet.
 */
export interface WalletToken extends Omit<Token, 'animationUrl'> {
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
export interface Collection {
    symbol: string
    name: string
    description: string
    /** url */
    image: string
    twitter: string
    discord: string
    website: string
    categories: string[]
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
 * /collections/:symbol/activities
 */
export interface CollectionStats {
    symbol: string
    floorPrice: number
    listedCount: number
    volumeAll: number
}

/**
 * launchpad collections
 * /launchpad/collections
 */
export interface LaunchpadCollection extends Omit<Collection, 'twitter' | 'discord' | 'website' | 'categories'> {
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
