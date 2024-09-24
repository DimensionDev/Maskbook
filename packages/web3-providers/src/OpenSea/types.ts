export enum EventType {
    Successful = 'successful',
    Cancelled = 'cancelled',
    BidEntered = 'bid_entered',
    BidWithdrawn = 'bid_withdrawn',
    Transfer = 'transfer',
    OfferEntered = 'offer_entered',
    Approve = 'approve',
}

interface OpenSeaFees {
    /**
     * @deprecated
     * use fee instead
     */
    opensea_seller_fee_basis_points: number
    opensea_buyer_fee_basis_points: number
    dev_seller_fee_basis_points: number
    dev_buyer_fee_basis_points: number
}

interface Asset {
    token_id: string
    token_address: string
    schema_name?: string
    version?: string
    name?: string
    decimals?: number
}

interface AssetEvent {
    event_type: string
    event_timestamp: number
    auction_type: string
    total_price: string
    payment_token: {
        decimals: number
        symbol: string
        usd_price: string
        address: string
    }
    quantity: string
}

export interface OpenSeaAssetContract extends OpenSeaFees {
    name: string
    address: string
    asset_contract_type: string
    schema_name: string
    seller_fee_basis_points: string
    buyer_fee_basis_points: string
    description: string
    symbol: string
    image_url: string
    stats?: object
    traits?: object[]
    external_link?: string
    wiki_link?: string
    collection: OpenSeaCollection
}

interface NumericalTraitStats {
    min: number
    max: number
}

interface OpenSeaTraitStats {
    [traitName: string]: NumericalTraitStats | Record<string, number>
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

export interface OpenSeaCustomAccount {
    address: string
    profile_img_url: string
    user?: {
        username: string
    }
}

export interface OpenSeaCollection extends OpenSeaFees {
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
    display_data: object
    payment_tokens: OpenSeaFungibleToken[]
    payout_address?: string
    trait_stats: OpenSeaTraitStats
    external_link?: string
    wiki_link?: string
    safelist_request_status: string
    owned_asset_count: number
    primary_asset_contracts: Array<{
        address: string
        asset_contract_type: string
        schema_name: string
        symbol: string
    }>
}

export interface OpenSeaAssetResponse extends Asset {
    animation_url: string
    asset_contract: OpenSeaAssetContract
    collection: OpenSeaCollection
    name: string
    description: string
    owner: OpenSeaCustomAccount
    // cspell:disable-next-line
    is_presale: boolean
    image_url: string
    image_preview_url: string
    image_original_url: string
    image_thumbnail_url: string
    opensea_link: string
    external_link: string
    traits: Array<{
        value: string
        trait_type: string
        trait_count: number
    }>
    num_sales: number
    last_sale: AssetEvent | null
    background_color: string | null
    transfer_fee: string | null
    transfer_fee_payment_token: OpenSeaFungibleToken | null
    top_ownerships: Array<{
        owner: OpenSeaCustomAccount
        quantity: string
    }>
    creator: OpenSeaCustomAccount
    endTime: string
    permalink: string
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
    payment_token?: OpenSeaFungibleToken
    quantity: string
    ending_price: string
    bid_amount?: string
    total_price?: string
    starting_price: string
    transaction?: {
        transaction_index: string
        transaction_hash: string
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

export interface OpenSeaCollectionStats {
    one_day_volume: number
    one_day_change: number
    one_day_sales: number
    one_day_average_price: number
    seven_day_volume: number
    seven_day_change: number
    seven_day_sales: number
    seven_day_average_price: number
    thirty_day_volume: number
    thirty_day_change: number
    thirty_day_sales: number
    thirty_day_average_price: number
    total_volume: number
    total_sales: number
    total_supply: number
    count: number
    num_owners: number
    average_price: number
    num_reports: number
    market_cap: number
    floor_price: number
}
