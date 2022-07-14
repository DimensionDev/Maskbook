import type { Result } from 'ts-results'
import type RSS3 from 'rss3-next'
import type { Transaction as Web3Transaction } from 'web3-core'
import type { api } from '@dimensiondev/mask-wallet-core/proto'
import type {
    NextIDAction,
    NextIDStoragePayload,
    NextIDPayload,
    NextIDPlatform,
    NextIDPersonaBindings,
} from '@masknet/shared-base'
import type {
    Transaction,
    FungibleAsset,
    NonFungibleToken,
    NonFungibleAsset,
    CurrencyType,
    Pageable,
    FungibleToken,
    OrderSide,
    NonFungibleTokenCollection,
    NonFungibleTokenContract,
    NonFungibleTokenOrder,
    NonFungibleTokenEvent,
    GasOptionType,
    HubOptions,
    HubIndicator,
    TokenType,
} from '@masknet/web3-shared-base'
import type { DataProvider } from '@masknet/public-api'
import type { ChainId } from '@masknet/web3-shared-evm'

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

    export interface TokenInfo {
        contractAddress: string
        tokenName: string
        symbol: string
        divisor: string
        tokenType: string
        totalSupply: string
        blueCheckmark: string
        description: string
        website: string
        email: string
        blog: string
        reddit: string
        slack: string
        facebook: string
        twitter: string
        bitcointalk: string
        github: string
        telegram: string
        wechat: string
        linkedin: string
        discord: string
        whitepaper: string
        tokenPriceUSD: string
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
            token_contribs?: Array<{
                token: string
                amount: string
            }>
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
        NFT = 'NFT',
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
    export interface Provider {
        getTokenPrice(platform_id: string, address: string, currency: CurrencyType): Promise<number>
        getTokensPrice(listOfAddress: string[], currency: CurrencyType): Promise<Record<string, number>>
        getTokenPriceByCoinId(coin_id: string, currency: CurrencyType): Promise<number>
    }
}

export namespace HistoryAPI {
    export interface Provider<ChainId, SchemaType> {
        getTransactions(
            address: string,
            options?: HubOptions<ChainId>,
        ): Promise<Array<Transaction<ChainId, SchemaType>>>
    }
}

export namespace GasOptionAPI {
    export interface Provider<ChainId, GasOption> {
        getGasOptions(chainId: ChainId): Promise<Record<GasOptionType, GasOption>>
    }
}

export namespace FungibleTokenAPI {
    export interface Provider<ChainId, SchemaType, Indicator = HubIndicator> {
        getAssets(
            address: string,
            options?: HubOptions<ChainId>,
        ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>, Indicator>>
    }
}

export namespace NonFungibleTokenAPI {
    export interface Provider<ChainId, SchemaType, Indicator = HubIndicator> {
        /** Get balance of a token owned by the account. */
        getBalance?: (address: string, options?: HubOptions<ChainId, Indicator>) => Promise<number>
        /** Get the detailed of a token. */
        getContract?: (
            address: string,
            options?: HubOptions<ChainId>,
        ) => Promise<NonFungibleTokenContract<ChainId, SchemaType> | undefined>
        /** Get a token asset. */
        getAsset?: (
            address: string,
            tokenId: string,
            options?: HubOptions<ChainId>,
        ) => Promise<NonFungibleAsset<ChainId, SchemaType> | undefined>
        /** Get a list of token assets */
        getAssets?: (
            address: string,
            options?: HubOptions<ChainId>,
        ) => Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>>
        /** Get a token. */
        getToken?: (
            address: string,
            tokenId: string,
            options?: HubOptions<ChainId>,
        ) => Promise<NonFungibleToken<ChainId, SchemaType> | undefined>
        /** Get a list of tokens. */
        getTokens?: (
            from: string,
            options?: HubOptions<ChainId, Indicator>,
        ) => Promise<Pageable<NonFungibleToken<ChainId, SchemaType>, Indicator>>
        /** Get history events related to a token. */
        getEvents?: (
            address: string,
            tokenId: string,
            options?: HubOptions<ChainId>,
        ) => Promise<Array<NonFungibleTokenEvent<ChainId, SchemaType>>>
        /** Get all listed orders for selling a token. */
        getListings?: (
            address: string,
            tokenId: string,
            options?: HubOptions<ChainId>,
        ) => Promise<Array<NonFungibleTokenOrder<ChainId, SchemaType>>>
        /** Get all listed orders for buying a token. */
        getOffers?: (
            address: string,
            tokenId: string,
            options?: HubOptions<ChainId>,
        ) => Promise<Array<NonFungibleTokenOrder<ChainId, SchemaType>>>
        /** Get all orders. */
        getOrders?: (
            address: string,
            tokenId: string,
            side: OrderSide,
            options?: HubOptions<ChainId>,
        ) => Promise<Array<NonFungibleTokenOrder<ChainId, SchemaType>>>
        /** Get all collections owned by the account. */
        getCollections?: (
            address: string,
            options?: HubOptions<ChainId, Indicator>,
        ) => Promise<Pageable<NonFungibleTokenCollection<ChainId>, Indicator>>
        /** Place a bid on a token. */
        createBuyOrder?: (/** TODO: add parameters */) => Promise<void>
        /** Listing a token for public sell. */
        createSellOrder?: (/** TODO: add parameters */) => Promise<void>
        /** Fulfill an order. */
        fulfillOrder?: (/** TODO: add parameters */) => Promise<void>
        /** Cancel an order. */
        cancelOrder?: (/** TODO: add parameters */) => Promise<void>
    }
}

export namespace RiskWarningBaseAPI {
    export interface Provider {
        approve(address: string, pluginID?: string): Promise<void>
    }
}

export namespace StorageAPI {
    export interface Storage<T> {
        get(key: string): Promise<T | undefined>
        set(key: string, value: T): Promise<void>
        delete?(key: string): Promise<void>
    }

    export interface Provider {
        createJSON_Storage?<T>(key: string): Storage<T>
        createBinaryStorage?<T>(key: string): Storage<T>
    }
}

export namespace NextIDBaseAPI {
    export interface Storage {
        set<T>(
            uuid: string,
            personaPublicKey: string,
            signature: string,
            platform: NextIDPlatform,
            identity: string,
            createdAt: string,
            patchData: unknown,
            pluginId: string,
        ): Promise<Result<T, string>>
        getByIdentity<T>(
            key: string,
            platform: NextIDPlatform,
            identity: string,
            pluginId: string,
        ): Promise<Result<T, string>>
        get<T>(key: string): Promise<Result<T, string>>
        getPayload(
            personaPublicKey: string,
            platform: NextIDPlatform,
            identity: string,
            patchData: unknown,
            pluginId: string,
        ): Promise<Result<NextIDStoragePayload, string>>
    }
    export interface Proof {
        bindProof(
            uuid: string,
            personaPublicKey: string,
            action: NextIDAction,
            platform: string,
            identity: string,
            createdAt: string,
            options?: {
                walletSignature?: string
                signature?: string
                proofLocation?: string
            },
        ): Promise<Result<unknown, string>>

        queryExistedBindingByPersona(personaPublicKey: string, enableCache?: boolean): Promise<any>

        queryExistedBindingByPlatform(platform: NextIDPlatform, identity: string, page?: number): Promise<any>

        queryAllExistedBindingsByPlatform(platform: NextIDPlatform, identity: string): Promise<NextIDPersonaBindings[]>

        queryIsBound(
            personaPublicKey: string,
            platform: NextIDPlatform,
            identity: string,
            enableCache?: boolean,
        ): Promise<boolean>

        createPersonaPayload(
            personaPublicKey: string,
            action: NextIDAction,
            identity: string,
            platform: NextIDPlatform,
            language?: string,
        ): Promise<NextIDPayload | null>
    }
}

export namespace SecurityAPI {
    export interface Holder {
        address?: string
        locked?: '0' | '1'
        tag?: string
        is_contract?: '0' | '1'
        balance?: number
        percent?: number
    }

    export interface TradingSecurity {
        buy_tax?: string
        sell_tax?: string
        slippage_modifiable?: '0' | '1'
        is_honeypot?: '0' | '1'
        transfer_pausable?: '0' | '1'
        is_blacklisted?: '0' | '1'
        is_whitelisted?: '0' | '1'
        is_in_dex?: '0' | '1'
        is_anti_whale?: '0' | '1'
        trust_list?: '0' | '1'
    }

    export interface ContractSecurity {
        is_open_source?: '0' | '1'
        is_proxy?: '0' | '1'
        is_mintable?: '0' | '1'
        owner_change_balance?: '0' | '1'
        can_take_back_ownership?: '0' | '1'
        owner_address?: string
        creator_address?: string
    }

    export interface TokenSecurity {
        token_name?: string
        token_symbol?: string

        holder_count?: number
        total_supply?: number
        holders?: Holder[]

        lp_holder_count?: number
        lp_total_supply?: number
        lp_holders?: Holder[]

        is_true_token?: '0' | '1'
        is_verifiable_team?: '0' | '1'
        is_airdrop_scam?: '0' | '1'
    }

    export interface SupportedChain<ChainId> {
        chainId: ChainId
        name: string
    }

    export interface Provider<ChainId> {
        getTokenSecurity(
            chainId: ChainId,
            listOfAddress: string[],
        ): Promise<Record<string, ContractSecurity & TokenSecurity & TradingSecurity> | void>
        getSupportedChain(): Promise<Array<SupportedChain<ChainId>>>
    }
}

export namespace TwitterBaseAPI {
    export interface NFTContainer {
        has_nft_avatar: boolean
        nft_avatar_metadata: AvatarMetadata
    }

    export interface AvatarMetadata {
        token_id: string
        smart_contract: {
            __typename: 'ERC721' | 'ERC1155'
            __isSmartContract: 'ERC721'
            network: 'Ethereum'
            address: string
        }
        metadata: {
            creator_username: string
            creator_address: string
            name: string
            description?: string
            collection: {
                name: string
                metadata: {
                    image_url: string
                    verified: boolean
                    description: string
                    name: string
                }
            }
            traits: Array<{
                trait_type: string
                value: string
            }>
        }
    }
    type UserUrl = {
        display_url: string
        expanded_url: string
        /** t.co url */
        url: string
        indices: [number, number]
    }
    export interface User {
        __typename: 'User'
        id: string
        rest_id: string
        affiliates_highlighted_label: {}
        has_nft_avatar: boolean
        legacy: {
            blocked_by: boolean
            blocking: boolean
            can_dm: boolean
            can_media_tag: boolean
            /** ISODateTime */
            created_at: string
            default_profile: boolean
            default_profile_image: boolean
            description: string
            entities: {
                description: {
                    urls: []
                }
                url: {
                    urls: UserUrl[]
                }
            }
            fast_followers_count: 0
            favourites_count: 22
            follow_request_sent: boolean
            followed_by: boolean
            followers_count: 35
            following: boolean
            friends_count: 76
            has_custom_timelines: boolean
            is_translator: boolean
            listed_count: 4
            location: string
            media_count: 196
            muting: boolean
            name: string
            normal_followers_count: 35
            notifications: boolean
            pinned_tweet_ids_str: []
            possibly_sensitive: boolean
            /** unused data, declare details when you need */
            profile_banner_extensions: any
            profile_banner_url: string
            /** unused data, declare details when you need */
            profile_image_extensions: any
            profile_image_url_https: string
            profile_interstitial_type: string
            protected: boolean
            screen_name: string
            statuses_count: number
            translator_type: string
            /** t.co url */
            url: string
            verified: boolean
            want_retweets: boolean
            withheld_in_countries: []
        }
        smart_blocked_by: false
        smart_blocking: false
        super_follow_eligible: false
        super_followed_by: false
        super_following: false
        legacy_extended_profile: {}
        is_profile_translatable: boolean
    }
    export type Response<T> = {
        data: T
    }
    export type UserByScreenNameResponse = Response<{ user: { result: User } }>
    export interface AvatarInfo {
        nickname: string
        userId: string
        imageUrl: string
        mediaId: string
    }

    export interface Settings {
        screen_name: string
    }

    export interface TwitterResult {
        media_id: number
        media_id_string: string
        size: number
        image: {
            image_type: string
            w: number
            h: number
        }
    }

    export interface Provider {
        getSettings: () => Promise<Settings | undefined>
        getUserNftContainer: (screenName: string) => Promise<
            | {
                  address: string
                  token_id: string
                  type_name: string
              }
            | undefined
        >
        uploadUserAvatar: (screenName: string, image: Blob | File) => Promise<TwitterResult>
        updateProfileImage: (screenName: string, media_id_str: string) => Promise<AvatarInfo | undefined>
        getUserByScreenName: (screenName: string) => Promise<User | null>
    }
}

export namespace InstagramBaseAPI {
    export interface Provider {
        uploadUserAvatar: (
            image: File | Blob,
            userId: string,
        ) => Promise<
            | {
                  changed_profile: boolean
                  profile_pic_url_hd: string
              }
            | undefined
        >
    }
}

export namespace TokenListBaseAPI {
    export interface Token<ChainId> {
        chainId: ChainId
        address: string
        name: string
        symbol: string
        decimals: number
        logoURI?: string
    }

    export interface TokenList<ChainId> {
        keywords: string[]
        logoURI: string
        name: string
        timestamp: string
        tokens: Array<Token<ChainId>>
        version: {
            major: number
            minor: number
            patch: number
        }
    }

    export interface TokenObject<ChainId> {
        tokens: Record<string, Token<ChainId>>
    }

    export interface Provider<ChainId, SchemaType> {
        fetchFungibleTokensFromTokenLists: (
            chainId: ChainId,
            urls: string[],
        ) => Promise<Array<FungibleToken<ChainId, SchemaType>>>
    }
}

export namespace MaskBaseAPI {
    export type Input = { id: number; data: api.IMWRequest }
    export type Output = { id: number; response: api.MWResponse }

    export type Request = InstanceType<typeof api.MWRequest>
    export type Response = InstanceType<typeof api.MWResponse>

    export type StoredKeyInfo = api.IStoredKeyInfo

    export interface Provider {}
}

export namespace TokenAPI {
    export interface TokenInfo {
        id: string
        market_cap: string
        price: string
    }
    export interface Provider {
        getTokenInfo(tokenName: string): Promise<TokenInfo | undefined>
    }
}

export enum NonFungibleMarketplace {
    OpenSea = 'OpenSea',
    LooksRare = 'LooksRare',
}

export namespace TrendingAPI {
    export interface Settings {
        currency: Currency
    }
    export enum TagType {
        CASH = 1,
        HASH = 2,
    }

    export interface Currency {
        id: string
        name: string
        symbol?: string
        description?: string
    }

    export interface Platform {
        id: string | number
        name: string
        slug: string
        symbol: string
    }

    export type CommunityType =
        | 'discord'
        | 'facebook'
        | 'instagram'
        | 'medium'
        | 'reddit'
        | 'telegram'
        | 'github'
        | 'youtube'
        | 'twitter'
        | 'other'
    export type CommunityUrls = Array<{ type: Partial<CommunityType>; link: string }>

    export interface Coin {
        id: string
        chainId?: ChainId
        name: string
        symbol: string
        type: TokenType
        decimals?: number
        is_mirrored?: boolean
        platform_url?: string
        tags?: string[]
        tech_docs_urls?: string[]
        message_board_urls?: string[]
        source_code_urls?: string[]
        community_urls?: CommunityUrls
        home_urls?: string[]
        announcement_urls?: string[]
        blockchain_urls?: string[]
        image_url?: string
        description?: string
        market_cap_rank?: number
        address?: string
        contract_address?: string
        facebook_url?: string
        twitter_url?: string
        telegram_url?: string
    }

    export interface Market {
        current_price: number
        circulating_supply?: number
        market_cap?: number
        max_supply?: number
        total_supply?: number
        total_volume?: number
        price_change_percentage_1h?: number
        price_change_percentage_24h?: number
        price_change_percentage_1h_in_currency?: number
        price_change_percentage_1y_in_currency?: number
        price_change_percentage_7d_in_currency?: number
        price_change_percentage_14d_in_currency?: number
        price_change_percentage_24h_in_currency?: number
        price_change_percentage_30d_in_currency?: number
        price_change_percentage_60d_in_currency?: number
        price_change_percentage_200d_in_currency?: number
        /** NFT only */
        floor_price?: number
        /** NFT only */
        highest_price?: number
        /** NFT only */
        owners_count?: number
        /** NFT only */
        royalty?: string
        /** NFT only */
        total_24h?: number
        /** NFT only */
        volume_24h?: number
        /** NFT only */
        average_volume_24h?: number
        /** NFT only */
        volume_all?: number
    }

    export interface Ticker {
        logo_url: string
        trade_url: string
        market_name: string
        /** fungible token only */
        base_name?: string
        /** fungible token only */
        target_name?: string
        price?: number
        volume?: number
        score?: string
        updated?: Date
        /** NFT only */
        volume_24h?: number
        /** NFT only */
        floor_price?: number
        /** NFT only */
        sales_24?: number
    }

    export interface Contract {
        chainId?: ChainId
        address: string
        iconURL?: string
    }

    export interface Trending {
        currency: Currency
        dataProvider: DataProvider
        coin: Coin
        platform?: Platform
        contracts?: Contract[]
        market?: Market
        tickers: Ticker[]
        lastUpdated: string
    }

    // #region historical
    export type Stat = [number | string, number]
    export interface HistoricalCoinInfo {
        id: number
        is_active: 0 | 1
        is_fiat: 0 | 1
        name: string
        quotes: []
        symbol: string
    }
    // #endregion

    export type HistoricalInterval = '1d' | '2h' | '1h' | '15m' | '5m'

    export type PriceStats = {
        market_caps: Stat[]
        prices: Stat[]
        total_volumes: Stat[]
    }

    export interface Provider<ChainId> {
        getCoinTrending(chainId: ChainId, id: string, currency: Currency): Promise<Trending>

        // #region get all coins
        getCoins(keyword?: string): Promise<Coin[]>
        // #endregion

        // #region get all currency
        getCurrencies(): Promise<Currency[]>
        // #endregion
        getPriceStats(chainId: ChainId, coinId: string, currency: Currency, days: number): Promise<Stat[]>
    }
}

export namespace RabbyTokenAPI {
    interface RawTokenSpender {
        id: string
        value: number
        exposure_usd: number
        protocol: {
            id: string
            name: string
            logo_url: string
            chain: string
        } | null
        is_contract: boolean
        is_open_source: boolean
        is_hacked: boolean
        is_abandoned: boolean
    }

    export interface RawTokenInfo {
        id: string
        name: string
        symbol: string
        logo_url: string
        chain: string
        price: number
        balance: number
        spenders: RawTokenSpender[]
    }

    export type TokenInfo = Omit<RawTokenInfo, 'spenders'>

    export type TokenSpender = Omit<RawTokenSpender, 'protocol'> & {
        tokenInfo: TokenInfo
        name: string | undefined
        logo: React.ReactNode | undefined
        isMaskDapp: boolean
    }

    export interface NFTInfo {
        chain: string
        amount: string
        contract_name: string
        is_erc721?: boolean
        contract_id: string
        isMaskDapp?: boolean
        spender: Omit<TokenSpender, 'tokenInfo'>
    }

    export interface Provider<ChainId> {
        getNonFungibleTokensFromTokenList(chainId: ChainId, account: string): Promise<NFTInfo[]>
    }
}
