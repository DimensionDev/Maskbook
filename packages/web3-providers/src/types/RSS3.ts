import type { HubOptions, Pageable } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import type RSS3 from 'rss3-next'

/**
 * Conform to the RFC3339 Datetime format.
 * @example "2022-08-23T07:15:00Z"
 */
type RFC3339Datetime = string
/** URL */
type URLString = string

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

    export interface GeneralAssetResponse {
        status: boolean
        assets: GeneralAsset[]
    }

    export interface ProfileInfo {
        avatar: string[]
        bio: string
        name: string
    }

    export interface Token {
        name?: string
        image?: string
        value?: string
        symbol?: string
        decimals?: number
        standard?: string
    }
    export interface Attribute {
        value: string
        trait_type: string
    }
    // TODO remove
    export interface Metadata {
        id?: string
        logo?: string
        title?: string
        token?: Token
        platform?: Platform
        description?: string
        image?: string
        attributes?: Attribute[]
        standard?: string
        name?: string
    }

    interface TransactionMetadata {
        /** Only exists for collectible tag */
        id?: string
        /** URL */
        image: string
        name: Network
        decimals: number
        /** Numberish string */
        value: string
        symbol: string
        /**
         * UI value
         * value_display is the value formatted with the correct number of decimals
         * */
        value_display: string
        collection?: string
        description?: string
        contract_address: string
        standard: 'ERC-20' | 'Native' | string
    }
    interface SwapMetadata {
        /**
         * @example "Uniswap V2"
         */
        protocol: string
        to: TransactionMetadata
        from: TransactionMetadata
    }
    interface LiquidityMetadata {
        /**
         * @example "Uniswap V2"
         */
        protocol: string
        action: 'add' | 'remove'
        tokens: [TransactionMetadata, TransactionMetadata]
    }

    interface CollectibleMetadata {
        id: string
        value: string
        value_display: string
        contract_address: string
        standard: 'ERC-721' | string
        name: string
        symbol: string
        /** URL */
        image: string
        attributes?: Attribute[]
        description: string
        animation_url: string
        external_link: string
    }
    interface TradeMetadata extends CollectibleMetadata {
        cost: TransactionMetadata
    }
    interface PoapMetadata {
        id: string
        name: string
        /** URL */
        image: string
        symbol: string
        standard: 'ERC-721' | string
        attributes: Attribute[]
        description: string
        contract_address: string
    }
    interface PostMetadata {
        title: string
        body: string
        media: [
            {
                /** URL */
                address: string
                mime_type: 'image/png' | string
            },
        ]
        type_on_platform: Type[]
    }
    interface ReviseMetadata extends PostMetadata {}
    interface ProfileMetadata {
        address: string
        network: Network
        platform: 'ENS' | string
        source: 'ENS' | string
        /**  @example 'vitalik.eth' */
        name: string
        /** @example 'vitalik.eth' */
        handle: string
        bio: string
        expire_at: RFC3339Datetime
    }
    interface LaunchMetadata {
        logo: URLString
        title: string
        platform: Platform
        description: string
    }
    export interface DonateMetadata extends LaunchMetadata {
        // here we have the donation value in detail
        token: TransactionMetadata
    }
    interface ProposeMetadata {
        type_on_platform: string[]
        id: string
        title: string
        body: string
        options: string[]
        startAt: RFC3339Datetime
        endAt: RFC3339Datetime
        organization: {
            type_on_platform: string[]
            id: string
            name: string
            about: string
        }
    }
    interface VoteMetadata {
        type_on_platform: string[]
        choice: number
        proposal: ProposeMetadata
    }
    export type UnifiedMetadata =
        | TransactionMetadata
        | SwapMetadata
        | LiquidityMetadata
        | CollectibleMetadata
        | TradeMetadata
        | PoapMetadata
        | PostMetadata
        | ReviseMetadata
        | ProfileMetadata
        | LaunchMetadata
        | DonateMetadata
        | ProposeMetadata
        | VoteMetadata

    type MetadataMap = {
        transfer: TransactionMetadata
        mint: TransactionMetadata
        burn: TransactionMetadata
        deposit: TransactionMetadata
        withdraw: TransactionMetadata
        swap: SwapMetadata
        trade: TradeMetadata
        liquidity: LiquidityMetadata
        poap: PoapMetadata
        post: PostMetadata
        revise: PostMetadata
        // TODO Not official documented
        comment: PostMetadata
        // TODO Not official documented
        share: PostMetadata
        profile: ProfileMetadata
        // TODO Not official documented
        follow: null
        // TODO Not official documented
        unfollow: null
        // TODO Not official documented
        like: null
        propose: ProposeMetadata
        vote: VoteMetadata
        launch: LaunchMetadata
        donate: DonateMetadata
    }

    type TypeMap = {
        [Tag.Transaction]: Type.Transfer | Type.Mint | Type.Burn
        [Tag.Exchange]: Type.Withdraw | Type.Deposit | Type.Swap | Type.Liquidity
        [Tag.Collectible]: Type.Transfer | Type.Trade | Type.Mint | Type.Burn | Type.Poap
        [Tag.Social]: Type.Post | Type.Revise | Type.Comment | Type.Share | Type.Profile
        [Tag.Donation]: Type.Launch | Type.Donate
        [Tag.Governance]: Type.Propose | Type.Vote
    }

    export interface ActionGeneric<T extends Tag, P extends TypeMap[T] = TypeMap[T]> {
        tag: T
        type: P
        index: number
        address_from?: string
        address_to?: string
        metadata?: MetadataMap[P]
        platform?: Platform
        related_urls?: string[]
    }

    export interface AddressStatus {
        update_at: RFC3339Datetime
        address: string
    }

    export type Network =
        | 'ethereum'
        // Discard
        // | 'ethereum_classic'
        | 'binance_smart_chain'
        | 'polygon'
        | 'zksync'
        | 'xdai'
        // Ignore this, since it's now supported runtime network
        // | 'arweave'
        | 'arbitrum'
        | 'optimism'
        | 'fantom'
        | 'avalanche'
        | 'crossbell'

    export const MaskNetworkMap: Record<Network, ChainId> = {
        ethereum: ChainId.Mainnet,
        binance_smart_chain: ChainId.BSC,
        polygon: ChainId.Matic,
        zksync: ChainId.ZKSync_Alpha_Testnet,
        xdai: ChainId.xDai,
        arbitrum: ChainId.Arbitrum,
        optimism: ChainId.Optimism,
        fantom: ChainId.Fantom,
        avalanche: ChainId.Avalanche,
        crossbell: ChainId.Crossbell,
    }

    export type Platform = 'mirror' | 'lens' | 'gitcoin' | 'snapshot' | 'uniswap' | 'binance' | 'crossbell'

    export enum Tag {
        Collectible = 'collectible',
        Donation = 'donation',
        Exchange = 'exchange',
        Governance = 'governance',
        Social = 'social',
        Transaction = 'transaction',
    }

    export enum Type {
        Transfer = 'transfer',
        Mint = 'mint',
        Burn = 'burn',
        Withdraw = 'withdraw',
        Deposit = 'deposit',
        Swap = 'swap',
        Liquidity = 'liquidity',
        Trade = 'trade',
        Poap = 'poap',
        Post = 'post',
        Revise = 'revise',
        Comment = 'comment',
        Share = 'share',
        Profile = 'profile',
        Follow = 'follow',
        Unfollow = 'unfollow',
        Like = 'like',
        Propose = 'propose',
        Vote = 'vote',
        Launch = 'launch',
        Donate = 'donate',
    }

    export enum AssetType {
        GitcoinDonation = 'Gitcoin-Donation',
        POAP = 'POAP',
        NFT = 'NFT',
    }

    export type LegacyTag = 'NFT' | 'Token' | 'POAP' | 'Gitcoin' | 'Mirror Entry' | 'ETH'

    export interface NameInfo {
        rnsName: string
        ensName: string | null
        address: string
    }

    export interface Metadata {
        collection_address?: string
        collection_name?: string
        contract_type?: string
        from?: string
        log_index?: string
        network?: Network
        proof?: string
        to?: string
        token_id?: string
        token_standard?: string
        token_symbol?: string
        token_address?: string
    }

    export interface Attachment {
        address?: string
        mime_type?: string
        size_in_bytes?: string
        type?: string
    }
    export interface Web3FeedGeneric<T extends Tag, P extends TypeMap[T] = TypeMap[T]> {
        timestamp: RFC3339Datetime
        /**
         * The identifier of the transaction. A unique identifier will be returned when a transaction hash is not available
         */
        hash: string
        /**
         * The on-chain log index.
         */
        index?: number
        /**
         * The transaction initiator.
         */
        address_from: string
        /**
         * The transaction recipient.
         */
        address_to: string
        /**
         * The owner of this note in a bidirectional feed.
         */
        owner: string
        /**
         * The fees paid for the transaction.
         */
        fee: number
        network: Network
        /**
         * There are many platforms supported by PreGod, see the full list. When platform is unknown, the transaction's network is used.
         */
        platform?: Platform
        /**
         *An array of actions generated by the transaction.
         */
        tag: T
        type: TypeMap[T]
        actions: Array<ActionGeneric<T, P>>
        address_status: AddressStatus[]
    }

    export type Web3Feed =
        | Web3FeedGeneric<Tag.Collectible>
        | Web3FeedGeneric<Tag.Donation>
        | Web3FeedGeneric<Tag.Exchange>
        | Web3FeedGeneric<Tag.Governance>
        | Web3FeedGeneric<Tag.Social>
        | Web3FeedGeneric<Tag.Transaction>

    export type Footprint = Web3FeedGeneric<Tag.Collectible, Type.Poap>
    export type Donation = Web3FeedGeneric<Tag.Donation, Type.Donate>
    export type Activity =
        | Web3FeedGeneric<Tag.Donation>
        | Web3FeedGeneric<Tag.Collectible>
        | Web3FeedGeneric<Tag.Transaction>

    export interface Web3FeedResponse {
        total: number
        cursor?: string
        list: Web3Feed[]
    }

    export interface Provider {
        createRSS3(address: string): RSS3
        getFileData<T>(rss3: RSS3, address: string, key: string): Promise<T | undefined>
        setFileData<T>(rss3: RSS3, address: string, key: string, data: T): Promise<T>
        getDonations(address: string): Promise<Pageable<Donation>>
        getFootprints(address: string): Promise<Pageable<Footprint>>
        getNameInfo(id: string): Promise<NameInfo | undefined>
        getProfileInfo(address: string): Promise<ProfileInfo | undefined>
        getWeb3Feeds(address: string, HubOptions?: HubOptions<ChainId>): Promise<Pageable<Activity>>
    }
}
