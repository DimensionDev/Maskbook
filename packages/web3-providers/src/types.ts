import type { Transaction as Web3Transaction } from 'web3-core'
import type RSS3 from 'rss3-next'
import type { CurrencyType } from '@masknet/plugin-infra'
import type {
    ChainId,
    ERC20TokenDetailed,
    ERC721ContractDetailed,
    ERC721TokenDetailed,
    NativeTokenDetailed,
} from '@masknet/web3-shared-evm'

export namespace ExplorerAPI {
    export type Transaction = Web3Transaction & {
        status: '0' | '1'
        confirmations: number
    }

    export interface PageInfo {
        offset?: number
        apikey?: string
    }

    export interface Provider {
        getLatestTransactions(account: string, url: string, pageInfo?: PageInfo): Promise<Transaction[]>
    }
}
export namespace RSS3BaseAPI {
    export interface GeneralAsset {
        platform: string
        identity: string
        id: string // contractAddress-id or admin_address
        type: string
        info: {
            collection?: string
            collection_icon?: string
            image_preview_url?: string | null
            animation_url?: string | null
            animation_original_url?: string | null
            title?: string
            total_contribs?: number
            token_contribs?: {
                token: string
                amount: string
            }[]
            start_date?: string
            end_date?: string
            country?: string
            city?: string
        }
    }

    export interface GeneralAssetWithTags extends GeneralAsset {
        tags?: string[]
    }

    export interface GeneralAssetResponse {
        status: boolean
        assets: GeneralAsset[]
    }

    export interface ProfileInfo {
        avatar: string[]
        bio: string
        name: string
    }

    export enum AssetType {
        GitcoinDonation = 'Gitcoin-Donation',
        POAP = 'POAP',
    }

    export interface NameInfo {
        rnsName: string
        ensName: string | null
        address: string
    }

    export interface Provider {
        createRSS3(address: string): RSS3
        getFileData<T>(rss3: RSS3, address: string, key: string): Promise<T | undefined>
        setFileData<T>(rss3: RSS3, address: string, key: string, data: T): Promise<T>
        getDonations(address: string): Promise<GeneralAssetResponse | undefined>
        getFootprints(address: string): Promise<GeneralAssetResponse | undefined>
        getNameInfo(id: string): Promise<NameInfo | undefined>
        getProfileInfo(address: string): Promise<ProfileInfo | undefined>
    }
}

export namespace PriceAPI {
    export interface CryptoPrice {
        [token: string]: {
            [key in CurrencyType]?: string
        }
    }

    export interface Provider {
        getTokenPrice(
            tokenId: string,
            currency: CurrencyType,
        ): Promise<{
            [key in CurrencyType]?: string
        }>
        getTokensPrice(tokenIds: string[], currency: CurrencyType): Promise<CryptoPrice>
    }
}

export namespace NonFungibleTokenAPI {
    export enum APIEnv {
        browser = 0,
        proxy = 1,
    }
    export enum OrderSide {
        Buy = 0,
        Sell = 1,
    }
    export interface AssetOwner {
        address: string
        profile_img_url?: string
        user?: {
            username: string
        }
        link: string
    }

    export interface AssetTrait {
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
        maker_account?: AssetOwner
        taker_account?: AssetOwner
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
        trait_stats: AssetTrait
        external_link?: string
        wiki_link?: string
        safelist_request_status: string
    }

    export interface Asset {
        is_verified: boolean
        collection?: AssetCollection
        is_auction: boolean
        image_url: string
        asset_contract: { name: string; description: string; schemaName: string } | null
        current_price: number | null
        current_symbol: string
        owner: AssetOwner | null
        creator: AssetOwner | null
        token_id: string
        token_address: string
        traits: AssetTrait[]
        safelist_request_status: string
        description: string
        name: string
        collection_name: string
        animation_url?: string
        end_time: Date | null
        order_payment_tokens: (ERC20TokenDetailed | NativeTokenDetailed)[]
        offer_payment_tokens: (ERC20TokenDetailed | NativeTokenDetailed)[]
        slug: string | null
        desktopOrder?: AssetOrder
        top_ownerships: {
            owner: AssetOwner
        }[]

        response_: any
    }

    export interface History {
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

    export interface Collection {
        name: string
        image?: string
        slug: string
    }

    export interface ContractBalance {
        contractDetailed: ERC721ContractDetailed
        balance?: number
    }

    export interface Options {
        chainId?: ChainId
        page?: number
        size?: number
        pageInfo?: { [key in string]: unknown }
    }

    export interface ProviderPageable<T> {
        data: T[]
        hasNextPage: boolean
        nextPageInfo?: { [key in string]: unknown }
    }

    export interface Provider {
        getContract?: (address: string, chainId: ChainId) => Promise<ERC721ContractDetailed | undefined>
        getContractBalance?: (address: string) => Promise<ContractBalance[]>
        getAsset?: (address: string, tokenId: string, opts?: { chainId?: ChainId }) => Promise<Asset | undefined>
        getToken?: (address: string, tokenId: string, chainId: ChainId) => Promise<ERC721TokenDetailed | undefined>
        getTokens?: (from: string, opts: Options) => Promise<ProviderPageable<ERC721TokenDetailed>>
        getHistory?: (address: string, tokenId: string, opts?: Options) => Promise<History[]>
        getListings?: (address: string, tokenId: string, opts?: Options) => Promise<AssetOrder[]>
        getOffers?: (address: string, tokenId: string, opts?: Options) => Promise<AssetOrder[]>
        getOrders?: (
            address: string,
            tokenId: string,
            side: NonFungibleTokenAPI.OrderSide,
            opts?: Options,
        ) => Promise<AssetOrder[]>
        getCollections?: (address: string, opts?: Options) => Promise<ProviderPageable<Collection>>
    }
}

export namespace StorageAPI {
    export interface Storage {
        set<T extends {}>(key: string, value: T): Promise<void>
        get<T>(key: string): Promise<T | void>
        delete?: (key: string) => Promise<void>
    }

    export interface Provider {
        createJSON_Storage?: (key: string) => Storage
        createBinaryStorage?: (key: string) => Storage
    }
}

export namespace SecurityAPI {
    export interface Holder {
        address?: string
        locked?: 0 | 1
        tag?: string
        is_contract?: 0 | 1
        balance?: number
        percent?: number
    }

    export interface ContractSecurity {
        is_open_source?: 0 | 1
        is_proxy?: 0 | 1
        is_mintable?: 0 | 1
        can_take_back_ownership?: string
        owner_address?: string
    }

    export interface TokenSecurity {
        holder_count?: number
        total_supply?: number
        holders?: Holder[]

        lp_holder_count?: number
        lp_total_supply?: number
        lp_holders?: Holder[]

        is_true_token?: 0 | 1
        is_verifiable_team?: 0 | 1
        is_airdrop_scam?: 0 | 1
    }

    export interface Provider {
        getTokenSecurity(
            chainId: number,
            listOfAddress: string[],
        ): Promise<Record<string, ContractSecurity & TokenSecurity> | void>
    }
}
