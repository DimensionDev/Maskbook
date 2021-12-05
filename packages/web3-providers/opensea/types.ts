import type { AssetOrder } from '../types'
export interface OpenSeaFees {
    opensea_seller_fee_basis_points: number
    opensea_buyer_fee_basis_points: number
    dev_seller_fee_basis_points: number
    dev_buyer_fee_basis_points: number
}

export interface Asset {
    token_id: string
    token_address: string
    schema_name?: string
    version?: string
    name?: string
    decimals?: number
}

export interface OpenSeaAssetContract extends OpenSeaFees {
    name: string
    address: string
    type: string
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

interface NumericalTraitStats {
    min: number
    max: number
}
interface StringTraitStats {
    [key: string]: number
}

interface OpenSeaTraitStats {
    [traitName: string]: NumericalTraitStats | StringTraitStats
}

interface OpenSeaFungibleToken {
    image_url?: string
    eth_price?: string
    usd_price?: string
    name: string
    symbol: string
    decimals: number
    address: string
}

interface OpenSeaCustomAccount {
    address: string
    profile_img_url: string
    user?: {
        username: string
    }
}

export interface OpenSeaCollection extends OpenSeaFees {
    name: string
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
    payment_tokens: OpenSeaFungibleToken[]
    payout_address?: string
    trait_stats: OpenSeaTraitStats
    external_link?: string
    wiki_link?: string
    safelist_request_status: string
}

export interface OpenSeaResponse extends Asset {
    animation_url: string
    asset_contract: OpenSeaAssetContract
    collection: OpenSeaCollection
    name: string
    description: string
    owner: OpenSeaCustomAccount
    orders: AssetOrder[] | null
    buy_orders: AssetOrder[] | null
    sell_orders: AssetOrder[] | null
    is_presale: boolean
    image_url: string
    image_preview_url: string
    image_url_original: string
    image_url_thumbnail: string
    opensea_link: string
    external_link: string
    traits: {
        trait_type: string
        value: string
    }[]
    num_sales: number
    last_sale: AssetEvent | null
    background_color: string | null
    transfer_fee: string | null
    transfer_fee_payment_token: OpenSeaFungibleToken | null
    top_ownerships: {
        owner: OpenSeaCustomAccount
        quantity: string
    }[]
    creator: OpenSeaCustomAccount
    endTime: string
}

interface AssetEvent {
    event_type: string
    event_timestamp: number
    auction_type: string
    total_price: string
    transaction: Transaction | null
    payment_token: OpenSeaFungibleToken | null
}

interface Transaction {
    from_account: OpenSeaCustomAccount
    to_account: OpenSeaCustomAccount
    created_date: string
    modified_date: string
    transaction_hash: string
    transaction_index: string
    block_number: string
    block_hash: string
    timestamp: number
}

export interface OpenSeaAssetEvent {
    id: string
    event_type: string
    from_account?: OpenSeaCustomAccount
    to_account?: OpenSeaCustomAccount
    seller?: OpenSeaCustomAccount
    winner_account?: OpenSeaCustomAccount
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
    payment_token: OpenSeaFungibleToken
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
