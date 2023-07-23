import type { Socket } from 'socket.io-client'
export enum SocketRequestNameSpace {
    Address = 'address',
    Assets = 'assets',
    Gas = 'gas',
}

export type SocketNameSpace = {
    namespace: SocketRequestNameSpace
    socket: typeof Socket
}

export enum SocketRequestType {
    SUBSCRIBE = 'subscribe',
    GET = 'get',
}

export type SocketRequestAssetScope = 'assets' | 'bsc-assets' | 'polygon-assets'

export type SocketRequestBody = {
    scope: string[]
    payload: Record<string, any>
}

export interface SocketResponseBody {
    meta: { status: string }
    payload: Record<string, any>
}

export enum ZerionRBDTransactionType {
    SEND = 'send',
    RECEIVE = 'receive',
    TRADE = 'trade',
    AUTHORIZE = 'authorize',
    EXECUTION = 'execution',
    DEPLOYMENT = 'deployment',
    CANCEL = 'cancel',
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
    BORROW = 'borrow',
    REPAY = 'repay',
    STAKE = 'stake',
    UNSTAKE = 'unstake',
    CLAIM = 'claim',
}

export enum ZerionTransactionStatus {
    CONFIRMED = 'confirmed',
    FAILED = 'failed',
    PENDING = 'pending',
}

export enum ZerionTransactionDirection {
    IN = 'in',
    OUT = 'out',
    SELF = 'self',
}

export interface ZerionPrice {
    value: number
    changed_at: number
    relative_change_24h?: number
}

export interface ZerionAsset {
    id: string
    asset_code: string
    name: string
    symbol: string
    decimals: number
    implementations: Record<string, { address: string; decimals: number }>
    type: string
    is_displayable: boolean
    is_verified: boolean
    icon_url?: string
    price?: ZerionPrice
}

export interface ZerionCovalentAsset {
    asset_code: string
    name: string
    symbol: string
    decimals: number
    icon_url?: string
    value: number
}

export interface ZerionAddressPosition {
    type: string
    asset: ZerionAsset
    chain: string
    quantity: string
}

export interface ZerionTransactionChange {
    asset: ZerionAsset
    value: number
    direction: ZerionTransactionDirection
    address_from: string
    address_to: string
    price?: number
}

export interface ZerionTransactionFee {
    value: number
    price: number
}

export interface ZerionTransactionItem {
    id: string
    type: ZerionRBDTransactionType
    protocol: string
    mined_at: number
    block_number: number
    status: ZerionTransactionStatus
    hash: string
    direction?: ZerionTransactionDirection
    address_from?: string
    address_to?: string
    contract?: string
    nonce?: number
    changes?: ZerionTransactionChange[]
    fee?: ZerionTransactionFee
    meta?: string
}

export interface ZerionNonFungibleAsset {
    asset_code: string
    symbol: string
    contract_address: string
    token_id: string
    interface: string
    preview: {
        url: string
        meta: {
            type: string
        }
    }
    detail: {
        url: string
        meta: {
            type: string
        }
    }
    name: string
    type: string
    tags?: string[]
    last_price?: number
    buy_now_price?: number
    floor_price: number
    total_last_price?: number
    total_floor_price?: number
    is_displayable: boolean
    is_verified: boolean
    collection: {
        name: string
        description: string
        icon_url: string
    }
    collection_info: {
        slug: string
        name: string
        description: string
        icon_url: string
    }
    changed_at: number
}

export interface ZerionNonFungibleTokenItem {
    id: string
    section: string
    section_tokens_count: number
    standard: LiteralUnion<'ERC1155' | 'ERC721'>
    value?: string
    displayed_on_chart: boolean
    amount: string
    asset: ZerionNonFungibleAsset
}

export interface ZerionTransactionResponseBody extends SocketResponseBody {
    meta: {
        status: string
        address: string
        addresses: string[]
        currency: string
        transactions_limit: number
        transactions_offset: number
        transactions_search_query: string
    }
    payload: {
        transactions: ZerionTransactionItem[]
    }
}

export interface ZerionNonFungibleTokenResponseBody extends SocketResponseBody {
    meta: {
        status: string
        addresses: string[]
        collection_slugs: string[]
        contract_addresses: string[]
        currency: string
        mode: string
        next_nft_offset: number
        nft_limit: number
        nft_offset: number
        sorted_by: string
    }
    payload: {
        nft: ZerionNonFungibleTokenItem[]
    }
}

export interface RelevantUrl {
    name: string
    url: string
}

export interface ZerionNonFungibleTokenInfoBody extends SocketResponseBody {
    payload: {
        'nft-info': {
            asset: ZerionNonFungibleAsset
            attributes: Array<{ key: string; value: string }>
            collection: {
                name: string
                description: string
                icon_url: string
            }
            collection_info: {
                slug: string
                name: string
                description: string
                icon_url: string
            }
            description: string
            relevant_urls: RelevantUrl[]
        }
    }
}
export interface ZerionNonFungibleCollection {
    collection_id: string
    name: string
    icon_url: string
    description: string
    floor_price: number
    nfts_count: number
    num_owners: number
    one_day_volume: number
    seven_day_volume: number
    thirty_day_volume: number
    one_day_change: number
    total_volume: number
    market_cap: number
    banner_image_url: string
    relevant_urls: RelevantUrl[]
    created_date?: string
}
export interface ZerionNonFungibleCollectionBody extends SocketResponseBody {
    payload: {
        'nft-collection-info': ZerionNonFungibleCollection
    }
}

type ZerionAssetResponseBodyPayload = {
    positions: {
        aggregation_in_progress: boolean
        positions: ZerionAddressPosition[]
    }
}

export interface ZerionAssetResponseBody extends SocketResponseBody {
    meta: {
        address: string
        addresses: string[]
        asset_codes: string[]
        currency: string
        status: string
    }
    payload: Partial<ZerionAssetResponseBodyPayload>
}

export interface ZerionCoinAsset {
    id: string
    asset_code: string
    name: string
    symbol: string
    decimals: number
    implementations: Record<string, { address: string; decimals: number }>
    type: any
    icon_url: string
    price: {
        changed_at: number
        relative_change_24h: number
        value: number
    }
    is_displayable: boolean
    is_verified: boolean
}
export interface ZerionCoin {
    asset: ZerionCoinAsset
    title: string
    subtitle: string
    tagline: any
    market_cap: number
    total_supply: number
    circulating_supply: number
    relative_changes: Record<string, number | null>
    tags: string[]
}

export interface ZerionCoinResponseBody extends SocketResponseBody {
    payload: {
        info: ZerionCoin[]
    }
}

export interface ZerionGasOption {
    info: {
        classic: {
            fast: number
            rapid: number
            slow: number
            standard: number
        }
    }
}

export interface ZerionGasResponseBody extends SocketResponseBody {
    payload: {
        ['chain-prices']: Record<string, ZerionGasOption>
    }
}
