import { ChainId } from '@masknet/web3-shared'
import { OPENSEA_API_KEY } from '../constants'

interface AssetContract {
    address: string
    asset_contract_type: string
    created_date: string
    name: string
    nft_version: string
    opensea_version: unknown | null
    owner: unknown | null
    schema_name: 'ERC721' | 'ERC1155'
    symbol: string
    total_supply: string
    description: string | null
    external_link: string | null
    image_url: string | null
    default_to_fiat: boolean
    dev_buyer_fee_basis_points: number
    dev_seller_fee_basis_points: number
    only_proxied_transfers: boolean
    opensea_buyer_fee_basis_points: number
    opensea_seller_fee_basis_points: number
    buyer_fee_basis_points: number
    seller_fee_basis_points: number
    payout_address: string | null
}

interface AssetOwner {
    user: {
        username: string | null
    }
    profile_img_url: string | null
    address: string | null
    config: string | null
    discord_id: string | null
}

interface AssetCollection {
    banner_image_url: string | null
    chat_url: string | null
    created_date: string
    default_to_fiat: boolean
    description: string | null
    dev_buyer_fee_basis_points: string
    dev_seller_fee_basis_points: string
    discord_url: string | null
    display_data: {
        card_display_style: 'contain' | 'padded'
        images: unknown[]
    }
    external_url: string | null
    featured: boolean
    featured_image_url: string | null
    hidden: boolean
    safelist_request_status: 'not_requested' | 'verified'
    image_url: string | null
    is_subject_to_whitelist: boolean
    large_image_url: string | null
    medium_username: string | null
    name: string
    only_proxied_transfers: boolean
    opensea_buyer_fee_basis_points: string
    opensea_seller_fee_basis_points: string
    payout_address: string | null
    require_email: boolean
    short_description: string | null
    slug: string
    telegram_url: string | null
    twitter_username: string | null
    instagram_username: string | null
    wiki_url: string | null
}

interface AssetCreator {
    user: {
        username: string | null
    }
    profile_img_url: string
    address: string
    config: string
    discord_id: string
}

export interface Asset {
    id: number
    token_id: string
    num_sales: number
    background_color: string | null
    image_url: string | null
    image_preview_url: string | null
    image_thumbnail_url: string | null
    image_original_url: string | null
    animation_url: string | null
    animation_original_url: string | null
    name: string
    description: string
    external_link: string
    asset_contract: AssetContract
    owner: AssetOwner
    permalink: string
    collection: AssetCollection
    decimals: number
    sell_orders: unknown[]
    creator: AssetCreator
    traits: unknown[]
    last_sale: unknown | null
    top_bid: unknown | null
    listing_date: unknown | null
    is_presale: boolean
    transfer_fee_payment_token: unknown | null
    transfer_fee: unknown | null
}

export interface AssetsListResponse {
    assets: Asset[]
}

export async function getAssetsList(from: string, opts: { chainId?: ChainId; page?: number; size?: number }) {
    const { chainId = ChainId.Mainnet, page = 0, size = 50 } = opts
    const params = new URLSearchParams()
    params.append('owner', from.toLowerCase())
    params.append('limit', String(size))
    params.append('offset', String(size * page))

    if (![ChainId.Mainnet, ChainId.Rinkeby].includes(chainId))
        return {
            assets: [],
        } as AssetsListResponse

    const response = await fetch(
        `https://${chainId === ChainId.Mainnet ? 'api' : 'rinkeby-api'}.opensea.io/api/v1/assets?${params.toString()}`,
        {
            method: 'GET',
            mode: 'cors',
            headers: {
                'x-api-key': OPENSEA_API_KEY,
            },
        },
    )
    return (await response.json()) as AssetsListResponse
}
