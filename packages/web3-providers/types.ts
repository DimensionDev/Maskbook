import type { ERC20TokenDetailed, NativeTokenDetailed } from '@masknet/web3-shared-evm'

export enum OrderSide {
    Buy = 0,
    Sell = 1,
}
export interface NFTAssetOwner {
    address: string
    profile_img_url?: string
    user?: {
        username: string
    }
    link: string
}

export interface NFTAssetTrait {
    trait_type: string
    value: string
}

export interface AssetToken {
    image_url?: string
    eth_price?: string
    usd_price?: string
    name: string
    symbol: string
    decimals: number
    address: string
}

export interface AssetOrder {
    created_time?: string
    current_price?: string
    current_bounty?: string
    maker_account?: NFTAssetOwner
    taker_account?: NFTAssetOwner
    payment_token?: string
    payment_token_contract?: AssetToken
    fee_recipient_account?: AssetToken
    cancelled_or_finalized?: boolean
    marked_invalid?: boolean
    approved_on_chain: boolean
    listing_time: number
    side: number
    quantity: string
    expiration_time: number
    order_hash: string
}

export interface AssetCollection {
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
    payment_tokens: AssetToken[]
    payout_address?: string
    trait_stats: NFTAssetTrait
    external_link?: string
    wiki_link?: string
    safelist_request_status: string
}

export interface NFTAsset {
    is_verified: boolean
    collection: AssetCollection | null
    is_auction: boolean
    image_url: string
    asset_contract: { name: string; description: string; schemaName: string } | null
    current_price: number | null
    current_symbol: string
    owner: NFTAssetOwner | null
    creator: NFTAssetOwner | null
    token_id: string
    token_address: string
    traits: NFTAssetTrait[]
    safelist_request_status: string
    description: string
    name: string
    collection_name: string
    animation_url: string
    end_time: Date | null
    order_payment_tokens: (ERC20TokenDetailed | NativeTokenDetailed)[]
    offer_payment_tokens: (ERC20TokenDetailed | NativeTokenDetailed)[]
    slug: string | null
    desktopOrder: AssetOrder | null
    top_ownerships: {
        owner: NFTAssetOwner
    }[]

    response_: any
}

export interface NFTHistory {
    id: string
    accountPair: {
        from?: {
            username?: string
            address?: string
            imageUrl?: string
            link: string
        }
        to?: {
            username?: string
            address?: string
            imageUrl?: string
            link: string
        }
    }
    price?: {
        quantity: string
        price: string
        asset?: {
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
        paymentToken?: AssetToken
    }

    eventType: string
    transactionBlockExplorerLink?: string
    timestamp: number
}
