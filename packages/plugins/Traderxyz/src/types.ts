/* eslint-disable no-restricted-imports */
/* eslint-disable spaced-comment */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface nftData {
    image_preview_url?: string
    image_thumbnail_url?: string
    nft_name?: string
    nft_id?: number
}

export interface TreeNftData {
    id: number
    token_id: string
    image_preview_url?: any
    is_selected: boolean
    collection_index: number
    item_index: number
}

export interface TradeMetaData {
    assetsInfo: {
        nfts: [
            {
                tokenAddress: string
                tokenId: string
                type: string
            },
        ]
        preview_info: {
            nftMediaUrls: nftData[]
            receivingSymbol: {
                symbol: string
                amount: number
            }
        }
        receiving_token: {
            tokenAddress: string
            type: string
            amount: number
        }
    }
    signedOrder: {
        makerAddress: string
        makerAssetAmount: string
        makerAssetData: string
        takerAddress: string
        takerAssetAmount: string
        takerAssetData: string
        expirationTimeSeconds: string
        senderAddress: string
        feeRecipientAddress: string
        salt: string
        makerFeeAssetData: string
        takerFeeAssetData: string
        makerFee: string
        takerFee: string
        signature: string
    }
}

export interface orderInfo {
    [key: string]: any
    receiving_token: object
}

export interface AssetContract {
    address: string
    asset_contract_type: string
    created_date: Date
    name: string
    nft_version: string
    opensea_version?: any
    owner: number
    schema_name: string
    symbol: string
    total_supply: string
    description?: any
    external_link?: any
    image_url?: any
    default_to_fiat: boolean
    dev_buyer_fee_basis_points: number
    dev_seller_fee_basis_points: number
    only_proxied_transfers: boolean
    opensea_buyer_fee_basis_points: number
    opensea_seller_fee_basis_points: number
    buyer_fee_basis_points: number
    seller_fee_basis_points: number
    payout_address?: any
}

export interface Token {
    id: number
    token_id: string
    name?: any
    image_preview_url?: any
    image_thumbnail_url?: any
    is_selected: boolean
    asset_contract: AssetContract
}

export interface PreviewNftListInterFace {
    collection_name?: string
    contract_address?: string
    tokens: Token[]
}

export type PreviewNftList = PreviewNftListInterFace

export interface OpenSeaAssetContract {
    address: string
    asset_contract_type: string
    created_date: Date
    name: string
    nft_version: string
    opensea_version?: any
    owner: number
    schema_name: string
    symbol: string
    total_supply: string
    description?: any
    external_link?: any
    image_url?: any
    default_to_fiat: boolean
    dev_buyer_fee_basis_points: number
    dev_seller_fee_basis_points: number
    only_proxied_transfers: boolean
    opensea_buyer_fee_basis_points: number
    opensea_seller_fee_basis_points: number
    buyer_fee_basis_points: number
    seller_fee_basis_points: number
    payout_address?: any
}

export interface OpenSeaDisplayData {
    card_display_style: string
    images: any[]
}

export interface OpenSeaCollection {
    banner_image_url?: any
    chat_url?: any
    created_date: Date
    default_to_fiat: boolean
    description?: any
    dev_buyer_fee_basis_points: string
    dev_seller_fee_basis_points: string
    discord_url?: any
    display_data: OpenSeaDisplayData
    external_url?: any
    featured: boolean
    featured_image_url?: any
    hidden: boolean
    safelist_request_status: string
    image_url?: any
    is_subject_to_whitelist: boolean
    large_image_url?: any
    medium_username?: any
    name: string
    only_proxied_transfers: boolean
    opensea_buyer_fee_basis_points: string
    opensea_seller_fee_basis_points: string
    payout_address?: any
    require_email: boolean
    short_description?: any
    slug: string
    telegram_url?: any
    twitter_username?: any
    instagram_username?: any
    wiki_url?: any
    is_nsfw: boolean
}

export interface OpenSeaUser {
    username: string
}

export interface OpenSeaOwner {
    user: OpenSeaUser
    profile_img_url: string
    address: string
    config: string
}

export interface OpenSeaCreator {
    user?: any
    profile_img_url: string
    address: string
    config: string
}

export interface OpenSeaAsset {
    decimals?: any
    token_id: string
}

export interface OpenSeaPaymentToken {
    symbol: string
    address: string
    image_url: string
    name?: any
    decimals: number
    eth_price: string
    usd_price: string
}

export interface OpenSeaUser2 {
    username?: any
}

export interface OpenSeaFromAccount {
    user: OpenSeaUser2
    profile_img_url: string
    address: string
    config: string
}

export interface OpenSeaToAccount {
    user?: any
    profile_img_url: string
    address: string
    config: string
}

export interface OpenSeaTransaction {
    block_hash: string
    block_number: string
    from_account: OpenSeaFromAccount
    id: number
    timestamp: Date
    to_account: OpenSeaToAccount
    transaction_hash: string
    transaction_index: string
}

export interface OpenSeaLastSale {
    asset: OpenSeaAsset
    asset_bundle?: any
    event_type: string
    event_timestamp: Date
    auction_type?: any
    total_price: string
    payment_token: OpenSeaPaymentToken
    transaction: OpenSeaTransaction
    created_date: Date
    quantity: string
}

export interface OpeanSeaToken {
    id: number
    num_sales: number
    background_color?: any
    image_url?: any
    image_preview_url?: any
    image_thumbnail_url?: any
    image_original_url?: any
    animation_url?: any
    animation_original_url?: any
    name?: any
    description?: any
    external_link?: any
    asset_contract: OpenSeaAssetContract
    permalink: string
    collection: OpenSeaCollection
    decimals?: number
    token_metadata: string
    is_nsfw: boolean
    owner: OpenSeaOwner
    sell_orders?: any
    creator: OpenSeaCreator
    traits: any[]
    last_sale: OpenSeaLastSale
    top_bid?: any
    listing_date?: any
    is_presale: boolean
    transfer_fee_payment_token?: any
    transfer_fee?: any
    token_id: string
}
