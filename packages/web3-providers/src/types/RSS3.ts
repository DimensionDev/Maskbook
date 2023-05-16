import type RSS3 from 'rss3-next'
import type { Pageable, MimeType } from '@masknet/shared-base'
import type { HubOptions } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
/**
 * Conform to the RFC3339 Datetime format.
 * @example "2022-08-23T07:15:00Z"
 */
type RFC3339Datetime = string
/** URL */
type URLString = string
/**
 * 2023-01-31 03:32:59 +0000 GMT
 */
type ISO8601Datetime = string

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
        value: string | number | Array<{ type: MimeType; uri: string }>
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

    export interface TransactionMetadata {
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
        standard: 'ERC-20' | 'ERC-721' | 'ERC-1155' | 'Native' | string
    }
    interface SwapMetadata {
        /**
         * @example "Uniswap V2"
         */
        protocol: string
        to: TransactionMetadata
        from: TransactionMetadata
    }
    // Uniswap like actions: add, collect, remove
    // Aave like actions: supply, withdraw, borrow, repay
    type LiquidityIn = 'supply' | 'add' | 'repay'
    type LiquidityOut = 'withdraw' | 'collect' | 'remove' | 'collect'
    interface LiquidityMetadata {
        /**
         * @example "Uniswap V2"
         */
        protocol: string
        action: LiquidityIn | LiquidityOut
        tokens: [TransactionMetadata, TransactionMetadata]
    }

    /**
     * `bridge` indicates an action of bridging assets from blockchain A to blockchain B.
     * action `deposit` refers to depositing tokens into blockchain A's bridge
     * action `withdraw` refers to withdrawing tokens from blockchain B's bridge
     */
    interface BridgeMetadata {
        token: TransactionMetadata
        action: 'deposit' | 'withdraw'
        target_network: {
            name: string
            symbol: string
            chain_id: number
        }
    }

    interface StakingMetadata {
        token: TransactionMetadata
        action: 'stake' | 'unstake' | 'claim'
        period: {
            start: ISO8601Datetime
            end: ISO8601Datetime
        }
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
        decimals: number
    }
    interface TradeMetadata extends CollectibleMetadata {
        cost?: TransactionMetadata
    }
    export interface MintMetadata extends TradeMetadata {}
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
    interface ApprovalBaseMetadata {
        name: string
        action: 'approve' | 'revoke'
        /** NFT or Token symbol */
        symbol: string
        collection: string
        contract_address: string
    }
    interface TokenApprovalMetadata extends ApprovalBaseMetadata {
        /** approve amount */
        value: string
        value_display: string
        decimals: number
        standard: 'ERC-20'
        /** TODO */
        image: string
    }
    interface CollectibleApprovalMetadata extends ApprovalBaseMetadata {
        standard: 'ERC-721' | 'ERC-1155'
        contract_address: string
        collection: string
    }
    export interface PostMetadata {
        title?: string
        body?: string
        summary?: string
        author: string[]
        created_at?: string
        target_url?: string
        media: Array<{
            /** URL or IPFS */
            address: string
            mime_type: 'image/png' | string
        }>
        type_on_platform: Type[]
    }
    interface CommentMetadata extends PostMetadata {
        target: PostMetadata
    }
    interface ShareMetadata {
        type_on_platform: Type[]
        target: PostMetadata
        comment?: CommentMetadata
    }
    interface ReviseMetadata extends PostMetadata {}
    interface ProfileMetadata {
        address: string
        network: Network
        platform: 'ENS' | 'Lens' | string
        source: 'ENS' | 'Lens' | string
        /** @example 'vitalik.eth' */
        name: string
        /** @example 'vitalik.eth' */
        handle: string
        bio: string
        expire_at: RFC3339Datetime
        /** unknown type, it could possibly be profile avatar url */
        profile_uri: string[]
        action: 'create' | 'update'
    }
    // TODO No official documentation
    interface ProxyMetadata extends Omit<ProfileMetadata, 'action'> {
        action: 'appoint'
    }
    export interface FollowMetadata extends Partial<Omit<ProfileMetadata, 'expire_at'>> {}
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
    export interface ProposeMetadata {
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
    export interface VoteMetadata {
        type_on_platform: Type[]
        /** option index, start from 1, could be multiple in format like `[1, 2, 3]` */
        choice: string
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

    export type MetadataMap = {
        [Tag.Transaction]: {
            [Type.Transfer]: TransactionMetadata
            [Type.Mint]: MintMetadata
            [Type.Burn]: TransactionMetadata
            [Type.Approval]: TokenApprovalMetadata
            [Type.Bridge]: BridgeMetadata
            [Type.Staking]: StakingMetadata
        }
        [Tag.Exchange]: {
            [Type.Deposit]: TransactionMetadata
            [Type.Withdraw]: TransactionMetadata
            [Type.Swap]: SwapMetadata
            [Type.Liquidity]: LiquidityMetadata
            [Type.Staking]: StakingMetadata
        }
        [Tag.Collectible]: {
            [Type.Approval]: CollectibleApprovalMetadata
            [Type.Transfer]: TransactionMetadata
            [Type.Trade]: TradeMetadata
            [Type.Mint]: MintMetadata
            [Type.Burn]: TransactionMetadata
            [Type.Poap]: PoapMetadata
        }
        [Tag.Social]: {
            [Type.Mint]: PostMetadata
            [Type.Post]: PostMetadata
            [Type.Revise]: PostMetadata
            [Type.Comment]: CommentMetadata
            [Type.Share]: ShareMetadata
            [Type.Profile]: ProfileMetadata
            [Type.Follow]: FollowMetadata
            [Type.Unfollow]: FollowMetadata
            [Type.Proxy]: ProxyMetadata
        }
        [Tag.Donation]: {
            [Type.Launch]: LaunchMetadata
            [Type.Donate]: DonateMetadata
        }
        [Tag.Governance]: {
            [Type.Propose]: ProposeMetadata
            [Type.Vote]: VoteMetadata
        }
    }

    export interface ActionGeneric<T extends Tag, P extends keyof MetadataMap[T] = keyof MetadataMap[T]> {
        tag: T
        type: P
        index: number
        /** It's different from transaction.address_from, the token payer */
        address_from?: string
        /** It's different from transaction.address_from, the token receiver */
        address_to?: string
        metadata?: MetadataMap[T][P]
        platform?: Platform
        related_urls?: string[]
    }

    export type TokenTransferAction = ActionGeneric<Tag.Transaction, Type.Transfer>
    export type CollectibleTransferAction = ActionGeneric<Tag.Collectible, Type.Transfer>
    export type CollectibleTradeAction = ActionGeneric<Tag.Collectible, Type.Trade>
    export type DonationDonateAction = ActionGeneric<Tag.Donation, Type.Donate>

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
        | 'EIP-1577'

    export type Platform =
        | 'arweave'
        | 'binance'
        | 'ENS Registrar'
        | '0x'
        | 'CrossSync'
        | 'Crossbell'
        | 'Gitcoin'
        | 'Lens'
        | 'MetaMask'
        | 'Mirror'
        | 'OpenSea'
        | 'Snapshot'
        | 'SushiSwap'
        | 'Uniswap'
        | 'crossbell.io'
        | 'xLog'
        | 'Farcaster'
        | 'Planet'
        | 'PancakeSwap'
        | 'Aave'
        | 'AAVE'

    export enum Tag {
        Collectible = 'collectible',
        Donation = 'donation',
        Exchange = 'exchange',
        Governance = 'governance',
        Social = 'social',
        Transaction = 'transaction',
    }

    export enum Type {
        Approval = 'approval',
        Transfer = 'transfer',
        Mint = 'mint',
        Burn = 'burn',
        Withdraw = 'withdraw',
        Deposit = 'deposit',
        Swap = 'swap',
        Liquidity = 'liquidity',
        Bridge = 'bridge',
        Trade = 'trade',
        Poap = 'poap',
        Post = 'post',
        Revise = 'revise',
        Comment = 'comment',
        Share = 'share',
        Proxy = 'proxy',
        Profile = 'profile',
        Follow = 'follow',
        Unfollow = 'unfollow',
        Like = 'like',
        Propose = 'propose',
        Vote = 'vote',
        Launch = 'launch',
        Donate = 'donate',
        Staking = 'staking',
    }

    export enum AssetType {
        GitcoinDonation = 'Gitcoin-Donation',
        POAP = 'POAP',
        NFT = 'NFT',
    }

    export type LegacyTag = 'NFT' | 'Token' | 'POAP' | 'Gitcoin' | 'Mirror Entry' | 'ETH'

    export interface NameInfo {
        ens: string
        crossbell: string
        lens: string
        spaceid: string
        unstoppable_domains: string
        bit: string
        avvy: string
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
    export interface Web3FeedGeneric<T extends Tag, P extends keyof MetadataMap[T] = keyof MetadataMap[T]> {
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
        fee?: number
        network: Network
        /**
         * There are many platforms supported by PreGod, see the full list. When platform is unknown, the transaction's network is used.
         * TODO declare a platform map
         */
        platform?: Platform
        /**
         *An array of actions generated by the transaction.
         */
        tag: T
        type: P
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

    /** For feed cards */
    export type TokenOperationFeed =
        | Web3FeedGeneric<Tag.Transaction, Type.Transfer | Type.Burn | Type.Mint>
        | Web3FeedGeneric<Tag.Exchange, Type.Deposit | Type.Withdraw>
    export type TokenBridgeFeed = Web3FeedGeneric<Tag.Transaction, Type.Bridge>
    export type TokenSwapFeed = Web3FeedGeneric<Tag.Exchange, Type.Swap>
    export type LiquidityFeed = Web3FeedGeneric<Tag.Exchange, Type.Liquidity>
    export type StakingFeed = Web3FeedGeneric<Tag.Exchange, Type.Staking>
    export type CollectibleFeed = Web3FeedGeneric<
        Tag.Collectible,
        Type.Transfer | Type.Trade | Type.Mint | Type.Burn | Type.Poap
    >
    export type CollectibleApprovalFeed = Web3FeedGeneric<Tag.Collectible, Type.Approval>
    export type CollectibleMintFeed = Web3FeedGeneric<Tag.Collectible, Type.Mint>
    export type CollectibleTradeFeed = Web3FeedGeneric<Tag.Collectible, Type.Trade>
    export type CollectibleTransferFeed = Web3FeedGeneric<Tag.Collectible, Type.Transfer>
    export type CollectibleBurnFeed = Web3FeedGeneric<Tag.Collectible, Type.Burn>
    export type DonationFeed = Web3FeedGeneric<Tag.Donation, Type.Donate>
    export type NoteFeed = Web3FeedGeneric<Tag.Social, Type.Post | Type.Revise | Type.Mint | Type.Share>
    export type CommentFeed = Web3FeedGeneric<Tag.Social, Type.Comment>
    export type ProfileFeed = Web3FeedGeneric<Tag.Social, Type.Profile>
    export type ProfileLinkFeed = Web3FeedGeneric<Tag.Social, Type.Follow | Type.Unfollow>
    export type ProfileProxyFeed = Web3FeedGeneric<Tag.Social, Type.Proxy>
    export type GovernanceFeed = Web3FeedGeneric<Tag.Governance, Type.Propose | Type.Vote>
    export type VoteFeed = Web3FeedGeneric<Tag.Governance, Type.Vote>
    export type ProposeFeed = Web3FeedGeneric<Tag.Governance, Type.Propose>
    export type TokenApprovalFeed = Web3FeedGeneric<Tag.Transaction, Type.Approval>

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
        getWeb3Feeds(address: string, HubOptions?: HubOptions<ChainId>): Promise<Pageable<Activity>>
    }
}
