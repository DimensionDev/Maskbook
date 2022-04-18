import type { NonFungibleTokenAPI } from '../types'

export interface Asset {
    token_id: string
    token_address: string
    schema_name?: string
    version?: string
    name?: string
    decimals?: number
}

interface LooksRareFungibleToken {
    image_url?: string
    eth_price?: string
    usd_price?: string
    name: string
    symbol: string
    decimals: number
    address: string
}

export interface LooksRareGetTokenResponse {
    id: number
    collectionAddress: string
    tokenId: string
    tokenURI: string
    imageURI: string
    isExplicit: boolean
    isAnimated: boolean
    flag: string
    attributes: [
        {
            traitType: string
            value: string
            displayType: string
        },
    ]
}

export interface LooksRareFees {
    opensea_seller_fee_basis_points: number
    opensea_buyer_fee_basis_points: number
    dev_seller_fee_basis_points: number
    dev_buyer_fee_basis_points: number
}

export interface LooksRareAssetContract extends LooksRareFees {
    name: string
    address: string
    asset_contract_type: string
    schema_name: string
    seller_fee_basis_points: number
    buyer_fee_basis_points: number
    description: string
    token_symbol: string
    image_url: string
    stats?: object
    traits?: object[]
    external_link?: string
    wiki_link?: string
}

export interface LooksRareCustomAccount {
    address: string
    profile_img_url: string
    user?: {
        username: string
    }
}

export interface LooksRareResponse extends Asset {
    animation_url: string
    asset_contract: LooksRareAssetContract
    collection: LooksRareCollection
    name: string
    description: string
    owner: LooksRareCustomAccount
    orders: NonFungibleTokenAPI.AssetOrder[] | null
    buy_orders: NonFungibleTokenAPI.AssetOrder[] | null
    sell_orders: NonFungibleTokenAPI.AssetOrder[] | null
    is_presale: boolean
    image_url: string
    image_preview_url: string
    image_original_url: string
    image_thumbnail_url: string
    opensea_link: string
    external_link: string
    traits: {
        trait_type: string
        value: string
    }[]
    num_sales: number
    last_sale: NonFungibleTokenAPI.AssetEvent | null
    background_color: string | null
    transfer_fee: string | null
    transfer_fee_payment_token: LooksRareFungibleToken | null
    top_ownerships: {
        owner: LooksRareCustomAccount
        quantity: string
    }[]
    creator: LooksRareCustomAccount
    endTime: string
}

interface NumericalTraitStats {
    min: number
    max: number
}

interface LooksRareTraitStats {
    [traitName: string]: NumericalTraitStats | Record<string, number>
}

export interface LooksRareCollection extends LooksRareFees {
    name: string
    address: string
    slug: string
    editors: string[]
    hidden: boolean
    featured: boolean
    created_date: string
    description: string
    image_url: string
    largeImage_url: string
    featured_image_url: string
    stats: object
    display_data: object
    payment_tokens: LooksRareFungibleToken[]
    payout_address?: string
    trait_stats: LooksRareTraitStats
    external_link?: string
    wiki_link?: string
    safelist_request_status: string
    owned_asset_count: number
    primary_asset_contracts: {
        address: string
        asset_contract_type: string
        symbol: string
    }[]
}

export interface LooksRareErrorResponse {
    success: boolean
    name: string
    message: string
    data: string
}

export interface LooksRareCollectionContract {
    address: string
    owner: string
    name: string
    description: string
    symbol: string
    type: string
    websiteLink: string
    facebookLink: string
    twitterLink: string
    instagramLink: string
    telegramLink: string
    mediumLink: string
    discordLink: string
    isVerified: boolean
    isExplicit: boolean
}

export interface LooksRareAssetEvent {
    id: string
    event_type: string
    from_account?: LooksRareCustomAccount
    to_account?: LooksRareCustomAccount
    seller?: LooksRareCustomAccount
    winner_account?: LooksRareCustomAccount
    asset: {
        id: string
        decimals: number
        image_url: string
        image_original_url: string
        image_preview_url: string
        asset_contract: {
            symbol: string
        }
        permalink: string
    }
    payment_token: LooksRareFungibleToken
    quantity: string
    ending_price: string
    bid_amount: string
    starting_price: string
    transaction: {
        blockExplorerLink: string
        id: string
    }
    assetQuantity: {
        asset: {
            decimals?: number
            id: string
        }
        quantity: string
        id: string
    }
    created_date: string
}

export interface LooksRareAssetOrder {
    approved_on_chain: boolean
    asset: LooksRareResponse
    listing_time: number
    created_time?: string

    current_price?: string
    current_bounty?: string
    maker: LooksRareCustomAccount
    taker: LooksRareCustomAccount

    payment_token?: string
    payment_token_contract?: NonFungibleTokenAPI.AssetToken
    fee_recipient?: NonFungibleTokenAPI.AssetToken

    cancelled?: boolean
    finalized?: boolean

    marked_invalid?: boolean

    side: number
    quantity: string
    expiration_time: number
    order_hash: string
}
