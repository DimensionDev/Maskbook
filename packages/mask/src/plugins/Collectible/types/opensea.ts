import type { OpenSeaPort } from 'opensea-js'
import type {
    AssetContractType,
    AuctionType,
    OpenSeaAccount,
    TokenStandardVersion,
    WyvernSchemaName,
} from 'opensea-js/lib/types'

export type CreateSellOrderPayload = Parameters<OpenSeaPort['createSellOrder']>[0]

export interface OpenSeaCustomTrait {
    trait_type: string
    value: string
}

export interface OpenSeaCustomAccount extends OpenSeaAccount {
    profile_img_url: string
}

export interface OpenSeaFungibleToken {
    image_url?: string
    eth_price?: string
    usd_price?: string
    name: string
    symbol: string
    decimals: number
    address: string
}

export interface OpenSeaCustomCollection extends OpenSeaCollection {
    safelist_request_status: string
    payment_tokens: OpenSeaFungibleToken[]
    slug: string
}

interface AssetToken {
    address: string
    decimals: number
    eth_price: string
    id: number
    image_url: string
    name: string
    symbol: string
    usd_price: string
}

export enum OpenSeaAssetEventType {
    CREATED = 'CREATED',
    SUCCESSFUL = 'SUCCESSFUL',
    CANCELLED = 'CANCELLED',
    OFFER_ENTERED = 'OFFER_ENTERED',
    BID_ENTERED = 'BID_ENTERED',
    BID_WITHDRAWN = 'BID_WITHDRAWN',
    TRANSFER = 'TRANSFER',
    APPROVE = 'APPROVE',
    COMPOSITION_CREATED = 'COMPOSITION_CREATED',
    CUSTOM = 'CUSTOM',
    PAYOUT = 'PAYOUT',
}

export interface OpenSeaAssetEvent {
    id: string
    event_type: OpenSeaAssetEventType
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

export interface OpenSeaAssetEventResponse {
    pageInfo: {
        hasNextPage: boolean
        endCursor: string
    }
    edges: OpenSeaAssetEvent[]
}

//#region opensea fetch response
export interface OpenSeaFees {
    opensea_seller_fee_basis_points: number
    opensea_buyer_fee_basis_points: number
    dev_seller_fee_basis_points: number
    dev_buyer_fee_basis_points: number
}

export interface Asset {
    token_id: string | null
    token_address: string
    schema_name?: WyvernSchemaName
    version?: TokenStandardVersion
    name?: string
    decimals?: number
}

export interface OpenSeaAssetContract extends OpenSeaFees {
    name: string
    address: string
    type: AssetContractType
    schema_name: WyvernSchemaName
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

export interface OpenSeaTraitStats {
    [traitName: string]: NumericalTraitStats | StringTraitStats
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

export interface AssetOrder {
    created_time?: string
    current_price?: string
    current_bounty?: string
    maker_account?: OpenSeaCustomAccount
    taker_account?: OpenSeaCustomAccount
    payment_token?: string
    payment_token_contract?: OpenSeaFungibleToken
    fee_recipient_account?: OpenSeaFungibleToken
    cancelled_or_finalized?: boolean
    marked_invalid?: boolean
    approved_on_chain: boolean
    listing_time: number
    side: number
    quantity: string
    expiration_time: number
    order_hash: string
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
    traits: OpenSeaCustomTrait[]
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

export interface AssetEvent {
    event_type: OpenSeaAssetEventType
    event_timestamp: number
    auction_type: AuctionType
    total_price: string
    transaction: Transaction | null
    payment_token: OpenSeaFungibleToken | null
}

export interface Transaction {
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

//#endregion
