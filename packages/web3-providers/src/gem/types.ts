export interface Identity {
    address: string
    config: string
    profile_img_url: string
    user: {
        username?: string
    }
}

export interface Trait {
    trait_count: number
    trait_type: string
    value: string
}

export interface PaymentToken {
    address: string
    decimals: string
    symbol: string
}

export interface PriceInfo {
    asset: string
    decimals: number
    endingPrice: string
    fees?: string
    price: string
    startingPrice: string
}

export interface Asset {
    id: string
    name: string
    address: string
    description: string
    collectionName: string
    collectionSymbol: string
    externalLink: string
    imageUrl: string
    smallImageUrl: string
    animationUrl: string
    tokenMetadata: string
    standard: string
    decimals: number
    traits: Trait[]
    creator: Identity
    owner: Identity
    market: string
    orderCreator: string
    openseaOrderCreatedAt: string
    currentBasePrice: number
    currentEthPrice: number
    currentUsdPrice: number
    ethReserves: string
    tokenReserves: string
    startingPrice: number
    endingPrice: number
    duration: number
    paymentToken: PaymentToken
    priceInfo?: PriceInfo
    quantity: number
    topBid: number
    sellOrders: {}
    lastSale: {}
    tokenType: 'ERC721' | 'ERC1155'
    marketUrl: string
}

export interface Collection {
    name: string
    symbol: string
    standard: string
    description: string
    address: string
    createdDate: string
    externalUrl: string
    imageUrl: string
    totalSupply: number
    isVerified: Boolean
    sevenDayVolume: number
    oneDayVolume: number
    lastOpenSeaSaleCreatedId: number
    lastOpenSeaTransferId: number
    lastOpenSeaCancelledId: number
    lastRaribleAssetUpdateId: string
    lastNumberOfUpdates: number
    chainId: string
    stats: {}
    traits: Trait[]
    indexingStatus: string
    indexingError: {}
    discordUrl: string
    mediumUsername: string
    telegramUrl: string
    twitterUsername: string
    instagramUsername: string
    wikiUrl: string
}

export interface Route {}
