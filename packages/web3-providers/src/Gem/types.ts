export interface Identity {
    address: string
    config: string
    profile_img_url: string
    user: {
        username?: string
    }
}

export interface Trait {
    trait_type: string
    trait_count: number
    trait_value: string
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
    _id: string
    id: string
    name?: string
    address: string
    description?: string
    collectionName: string
    collectionSymbol: string
    externalLink: string
    imageUrl: string
    smallImageUrl: string
    animationUrl?: string
    standard: string
    decimals: number
    traits: Array<{
        trait_type: string
        value: string
        display_type?: string
        max_value?: string
        trait_count: number
        order?: number
    }>
    creator: {
        user: {
            username: string
        }
        profile_img_url: string
        address: string
        config: string
    }
    owner: {
        user: {
            username?: string
        }
        profile_img_url: string
        address: string
        config: string
    }
    currentBasePrice: number
    duration: number
    endingPrice?: string
    ethReserves?: string
    market: string
    marketUrl: string
    openseaOrderCreatedAt?: string
    paymentToken: {
        address: string
        decimals: string
        symbol: string
    }
    startingPrice?: string
    tokenReserves?: string
    rarityScore: number
    orderCreatedAt: number
    marketplace: string
    tokenId: string
    priceInfo: {
        price: string
        asset: string
        decimals: number
        startingPrice?: string
        endingPrice?: string
        fees?: string
    }
    url: string
    tokenType: string
}

export interface Collection {
    address: string
    description: string
    discordUrl: string
    name: string
    symbol: string
    standard: 'ERC721' | 'ERC1155'
    createdDate: string
    externalUrl: string
    imageUrl: string
    marketStats: Array<{
        _id: string
        count: number
    }>
    totalSupply: number
    isVerified: boolean
    sevenDayVolume: number
    oneDayVolume: number
    lastOpenSeaSaleCreatedId: number
    lastOpenSeaTransferId: number
    lastOpenSeaCancelledId: number
    lastRaribleAssetUpdateId: string
    lastNumberOfUpdates: number
    chainId: string
    stats: {
        average_price: number
        count: number
        floor_price: number
        market_cap: number
        num_owners: number
        num_reports: number
        one_day_average_price: number
        one_day_change: number
        one_day_sales: number
        one_day_volume: number
        seven_day_average_price: number
        seven_day_change: number
        seven_day_sales: number
        seven_day_volume: number
        thirty_day_average_price: number
        thirty_day_change: number
        thirty_day_sales: number
        thirty_day_volume: number
        total_sales: number
        total_supply: number
        total_volume: number
    }
    traits: Trait[]
    indexingStatus: string
    indexingError: {}
    mediumUsername?: string
    telegramUrl?: string
    twitterUsername: string
    instagramUsername?: string
    wikiUrl?: string
    rarityRankingStatus: 'verified' | 'unverified'
    raritySniperUrl: string
    revealPercentage: string
    slug: string
    updatedAt: string
    _id: string
    traitCounts: Array<{
        _id: number
        count: number
    }>
}

export interface Route {}
