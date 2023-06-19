import { type BigNumber } from 'bignumber.js'

// TODO: Contract address will be added in SimpleHash v1 release.
// TODO: Asking SimpleHash to add schema in SimpleHash v1 release.
export interface Collection {
    // TODO: the collection id key name may change in SimpleHash v1 release.
    id: string
    chain: string
    banner_image_url: string
    collection_id: string
    description: string
    external_url: string
    spam_score?: number
    discord_url: string
    floor_prices: Array<{
        marketplace_id: string // opensea
        marketplace_name: string // Opensea
        value: number
        payment_token: PaymentToken
    }>
    image_url: string
    marketplace_pages?: Array<{
        collection_url: string
        nft_url: string
        marketplace_collection_id: string
        marketplace_id: string
        marketplace_name: string
        verified: boolean
    }>
    distinct_nfts_owned: number
    total_copies_owned: number
    distinct_owner_count: number
    distinct_nft_count: number
    name: string
    /** e.g ["ethereum.0x18487d2cac946c7fe800855c4039aac210f68baa"] */
    top_contracts: string[]
    total_quantity: number
    /** twitter handler */
    twitter_username: string | null
    instagram_username: string | null
    medium_username: string | null
    telegram_url: string | null
}
export interface Asset {
    chain: string // ethereum
    collection: Collection
    contract: {
        deployed_by: string // EOA
        deployed_via_contract: string | null
        name: string
        symbol: string
        type: string // ERC721
    }
    contract_address: string
    description: string
    image_url: string
    name: string
    created_date: string // "2022-04-04T20:15:02"
    token_id: string
    token_count: number
    nft_id: string // ethereum.0x18487d2cac946c7fe800855c4039aac210f68baa.1597
    last_sale?: {
        from_address: string
        to_address: string
        marketplace_id: string
        total_price?: BigNumber.Value
        unit_price: BigNumber.Value
        transaction: string // tx hash
        marketplace_name: string
        payment_token?: PaymentToken
        timestamp: string // "2022-04-04T20:15:02"
    }
    owners: Array<{
        owner_address: string
    }>
    previews: {
        blurhash: string
        image_large_url: string
        image_medium_url: string
        image_opengraph_url: string
        image_small_url: string
        predominant_color: string
    }
}

export interface PaymentToken {
    address: string | null
    decimals: number
    name: string
    payment_token_id: string // e.g. ethereum.native
    symbol: string
    value: BigNumber.Value
}

export interface PriceStat {
    timestamp: string
    floor_price: number
}

export interface CollectionOverview {
    collection_id: string
    name: string
    all_time_volume: number
    market_cap: number
    payment_token: PaymentToken
    '1_day_volume': number
    '1_day_prior_volume': number
    '1_day_volume_change_percent': number
    '7_day_volume': number
    '30_day_volume': number
    '90_day_volume': number
}

export enum ActivityType {
    Transfer = 'transfer',
    Mint = 'mint',
    Sale = 'sale',
    Burn = 'burn',
}

export interface Activity {
    nft_id: string
    chain: string
    contract_address: string
    token_id: string
    event_type: ActivityType
    from_address: string
    to_address: string
    quantity: number
    timestamp: string
    transaction: string
    transaction_initiator: string
    sale_details: {
        marketplace_id: string
        marketplace_name: string
        payment_token: PaymentToken
        unit_price: number
        total_price: number
    }
}
