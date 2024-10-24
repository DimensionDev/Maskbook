type WithoutChainId<T> = Omit<T, 'chain_id'>
type WithNumberChainId<T> = WithoutChainId<T> & { chain_id: number }

export namespace FireflyConfigAPI {
    export type Result<T> = {
        code: number
        reason: string
        message: string
        data: T
    }

    export interface LensAccount {
        address: string
        name: string
        handle: string
        bio: string
        url: string
        profileUri: string[]
        ownedBy?: string
        isFollowing?: boolean
    }

    export type LensResult = Result<LensAccount[]>

    export type VerifyTwitterResult = { error: string } | { data: string[] }

    export interface UnionProfileOptions {
        twitterId?: string
        walletAddress?: string
        /** e.g vitalik.lens */
        lensHandle?: string
        /** hex string */
        farcasterUserName?: string
        lensProfileId?: string
        fid?: string
    }

    interface MediaSet {
        original: {
            url: string
            mimeType: string
        }
    }
    export interface LensProfile {
        address: string
        network: string
        platform: string
        source: string
        name: string
        handle: string
        bio: string
        url: string
        profile_uri: string
        picture: {
            original: {
                url: string
                mimeType: string
            }
        }
        coverPicture: MediaSet
        stats: {
            totalFollowers: string
            totalFollowing: string
            totalPosts: string
        }
        totalComments: string
        totalMirrors: string
        totalPublications: string
        totalCollects: string

        attributes: any[]
    }
    export interface FarcasterProfile {
        id: number
        fid: string
        raw_data: string
        username: string
        display_name: string
        signer_address: string
        verified_raw_data: string
        avatar: {
            url: string
            isVerified: string
        }
        bio: string
        followerCount: string
        followingCount: string
    }

    export interface WalletProfile {
        address: string
        ens: string
        blockchain: string
        verifiedSources: any[]
        is_connected: string
        avatar: string
    }
    /**
     * @see https://www.notion.so/mask/data-39e990f8748142048802ff17d2a98f49?pvs=4
     */
    export interface UnionProfile {
        lensProfiles: LensProfile[]
        farcasterProfiles: FarcasterProfile[]
        walletProfiles: WalletProfile[]
    }
    export interface UnionProfileResponse {
        code: number
        data: UnionProfile
    }

    export interface Collection {
        collection_details: {
            top_contracts: string[]
            name: string
            description: string
            image_url: string
        }
    }

    export interface CollectionsResponse {
        code: number
        data: {
            collections: Collection[]
            cursor: string
        }
    }
}

export namespace FireflyRedPacketAPI {
    export enum PlatformType {
        lens = 'lens',
        farcaster = 'farcaster',
        twitter = 'twitter',
    }

    export enum ActionType {
        Send = 'send',
        Claim = 'claim',
    }

    export enum SourceType {
        All = 'all',
        FireflyAPP = 'firefly_app',
        FireflyPC = 'firefly_pc',
        MaskNetwork = 'mask_network',
    }

    export enum RedPacketStatus {
        View = 'VIEW',
        Refunding = 'REFUNDING',
        Refund = 'REFUND',
        Expired = 'EXPIRED',
        Empty = 'EMPTY',
        Send = 'SEND',
    }

    export enum StrategyType {
        profileFollow = 'profileFollow',
        postReaction = 'postReaction',
        nftOwned = 'nftOwned',
    }

    export interface StrategyPayload {
        type: StrategyType
        payload: Array<ProfileFollowStrategyPayload | NftOwnedStrategyPayload> | PostReactionStrategyPayload
    }

    export interface ProfileFollowStrategyPayload {
        platform: PlatformType
        profileId: string
    }

    export interface PostReactionStrategyPayload {
        params?: Array<{
            platform: PlatformType
            postId: string
            handle?: string
        }>
        reactions: string[]
    }

    export interface NftOwnedStrategyPayload {
        chainId: number
        contractAddress: string
    }

    export interface PostReaction {
        platform: PlatformType
        postId: string
    }

    export interface ProfileReaction {
        platform: PlatformType
        profileId: string
        lensToken?: string
        farcasterSignature?: HexString
        farcasterSigner?: HexString
        farcasterMessage?: HexString
    }

    export interface PostOn {
        platform: PlatformType
        postId: string
        handle: string
    }

    export interface ClaimPlatform {
        platformName: PlatformType
        platformId: string
    }

    export interface RedPacketSentInfoItem {
        create_time: number
        total_numbers: string
        total_amounts: string
        rp_msg: string
        claim_numbers: string
        claim_amounts: string
        token_symbol: string
        token_decimal: number
        token_logo: string
        redpacket_id: HexString
        trans_hash: HexString
        log_idx: number
        chain_id: string
        redpacket_status: RedPacketStatus
        claim_strategy: StrategyPayload[]
        theme_id: string
        share_from: string
    }

    export interface RedPacketClaimedInfoItem {
        redpacket_id: HexString
        received_time: string
        rp_msg: string
        token_amounts: string
        token_symbol: string
        token_decimal: number
        token_logo: string
        trans_hash: HexString
        log_idx: string
        creator: HexString
        chain_id: string
        redpacket_status: RedPacketStatus
        ens_name: string
    }

    export interface RedPacketClaimedInfo extends WithNumberChainId<RedPacketClaimedInfoItem> {}
    export interface RedPacketSentInfo extends WithNumberChainId<RedPacketSentInfoItem> {}
    export interface RedPacketClaimListInfo extends WithNumberChainId<RedPacketClaimListInfoItem> {}

    export interface ClaimList {
        creator: string
        claim_platform: Platform[]
        token_amounts: string
        token_symbol: string
        token_decimal: number
    }

    export interface Platform {
        platformName: PlatformType
        platformId: string
        platform_handle: string
    }

    export interface RedPacketClaimListInfoItem {
        list: ClaimList[]
        creator: string
        create_time: number
        rp_msg: string
        claim_numbers: string
        claim_amounts: string
        total_numbers: string
        total_amounts: string
        token_symbol: string
        token_decimal: number
        token_logo: string
        chain_id: string
        cursor: string
        size: string
        ens_name: string
    }

    export interface Theme {
        themeId: string
        payloadUrl: string
        coverUrl: string
    }

    export type ThemeSettings = {
        [key in 'title1' | 'title2' | 'title3' | 'title4' | 'title_symbol']: {
            color: '#F1D590'
            font_size: 55
            font_family: 'Helvetica'
            font_weight: 700
            line_height: 63.25
        }
    } & {
        bg_color: string
        bg_image: string
        logo_image: string
    }

    export interface ThemeGroupSettings {
        /** theme id */
        tid: string
        cover: ThemeSettings
        normal: ThemeSettings
        /** Redpacket without theme settings preset, current ones are default */
        is_default?: boolean
    }

    export interface Response<T> {
        code: number
        data: T
    }

    export type PublicKeyResponse = Response<{
        publicKey: HexString
    }>

    export type ClaimResponse = Response<{
        signedMessage: HexString
    }>

    export type HistoryResponse = Response<{
        cursor: number
        size: number
        list: RedPacketSentInfo[] | RedPacketClaimedInfo[]
    }>

    export type ClaimHistoryResponse = Response<RedPacketClaimListInfo>

    export interface ParseOptions {
        text?: string
        image?: {
            imageUrl: string
        }
        walletAddress?: string
        platform?: PlatformType
        profileId?: string
    }
    export interface ParseResult {
        content: string
        /** only `text` for now */
        type: string
        /** only 1 for now */
        version: number
        serializable: true
        meta: object
        redpacket: {
            /** the same as meta */
            payload: object
            canClaim: boolean
            canRefund: boolean
            canSend: boolean
            isPasswordValid: boolean
            isClaimed: boolean
            isEmpty: boolean
            isExpired: boolean
            isRefunded: boolean
            claimedNumber: number
            claimedAmount: string
        } | null
    }
    export type ParseResponse = Response<ParseResult>

    export type CheckClaimStrategyStatusOptions = {
        rpid: string
        profile: {
            needLensAndFarcasterHandle?: boolean
            platform: PlatformType
            profileId?: string
            lensToken?: string
            farcasterSignature?: HexString
            farcasterSigner?: HexString
            farcasterMessage?: HexString
        }
        wallet: {
            address: string
        }
    }
    export type PostReactionKind = 'like' | 'repost' | 'quote' | 'comment' | 'collect'
    export type ClaimStrategyStatus =
        | {
              type: 'profileFollow'
              payload: Array<{ platform: PlatformType; profileId: string; handle: string }>
              result: boolean
          }
        | {
              type: 'nftOwned'
              payload: Array<{
                  chainId: number
                  contractAddress: HexString
                  collectionName: string
              }>
              result: boolean
          }
        | {
              type: 'postReaction'
              payload: {
                  reactions: PostReactionKind[]
                  params: Array<
                      [
                          {
                              platform: PlatformType
                              postId: string
                          },
                      ]
                  >
              }
              result: {
                  conditions: Array<{ key: PostReactionKind; value: boolean }>
                  hasPassed: boolean
              }
          }
    export type CheckClaimStrategyStatusResponse = Response<{
        claimStrategyStatus: ClaimStrategyStatus[]
        canClaim: boolean
    }>

    export type ThemeListResponse = Response<{
        list: ThemeGroupSettings[]
    }>

    export type ThemeByIdResponse = Response<ThemeGroupSettings>
}
