import type { RedPacketMetaKey, RedPacketNftMetaKey, SolanaRedPacketMetaKey } from '@masknet/shared-base'

type WithoutChainId<T> = Omit<T, 'chain_id'>
type WithNumberChainId<T> = WithoutChainId<T> & { chain_id: number }

export interface FireflyResponse<T> {
    code: number
    data: T
}

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
    export interface LensProfileV3 {
        id: string
        ownedBy: string
        nameSpace: string
        /** @example "bob" */
        localName: string
        /** @example "lens/bob" */
        fullHandle: string
    }
    export interface FarcasterProfile {
        id: number
        fid: number
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
        lensProfilesV2: unknown[]
        lensProfilesV3: LensProfileV3[]
    }
    export interface UnionProfileResponse {
        code: number
        data: UnionProfile
    }
    export type UploadMediaTokenResponse = FireflyResponse<{
        bucket: string
        cdnHost: string
        region: string
        accessKeyId: string
        secretAccessKey: string
        sessionToken: string
    }>
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
        tokens = 'tokens',
    }

    export type StrategyPayload =
        | {
              type: StrategyType.profileFollow
              payload: ProfileFollowStrategyPayload[]
          }
        | {
              type: StrategyType.postReaction
              payload: PostReactionStrategyPayload
          }
        | {
              type: StrategyType.nftOwned
              payload: NftOwnedStrategyPayload[]
          }
        | {
              type: StrategyType.tokens
              payload: TokensStrategyPayload[]
          }

    export interface ProfileFollowStrategyPayload {
        platform: PlatformType
        profileId: string
        /**
         * Depends on the platform which created the redpacket
         * for example, Firefly APP doesn't provide it, but Firefly Web does
         */
        handle?: string
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
        /** instead of number, it's string */
        chainId: string
        contractAddress: string
        collectionName: string
        icon?: string
    }
    export interface TokensStrategyPayload {
        /** instead of number, it's string */
        chainId: string
        contractAddress: string
        name: string
        symbol: string
        decimals: number
        amount: string
        icon?: string
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

    export interface RedPacketBaseInfo {
        rp_msg: string
        token_symbol: string
        token_decimal: number
        token_logo: string
        chain_id: string
        redpacket_id: HexString
        trans_hash: HexString
        log_idx: string
        redpacket_status: RedPacketStatus
    }
    export interface RedPacketSentInfoItem extends RedPacketBaseInfo {
        create_time: number
        total_numbers: string
        total_amounts: string
        claim_numbers: string
        claim_amounts: string
        claim_strategy: StrategyPayload[]
        theme_id: string
        share_from: string
        duration: number
    }

    export interface RedPacketClaimedInfoItem extends RedPacketBaseInfo {
        received_time: string
        token_amounts: string
        creator: HexString
        ens_name: string
    }

    export interface RedPacketClaimedInfo extends WithNumberChainId<RedPacketClaimedInfoItem> {}
    export interface RedPacketSentInfo extends WithNumberChainId<RedPacketSentInfoItem> {}
    export interface RedPacketClaimListInfo extends WithNumberChainId<RedPacketClaimListInfoItem> {}

    export interface ClaimInfo {
        /** claim user's address */
        creator: string
        claim_platform: Platform[]
        ens_name: string
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
        list: ClaimInfo[]
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
            color: string
            font_size: number
            font_family: string
            font_weight: number
            line_height: number
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

    export type PublicKeyResponse = FireflyResponse<{
        publicKey: HexString
    }>

    export type ClaimResponse = FireflyResponse<
        | {
              signedMessage: HexString
          }
        | undefined
    >

    export type HistoryResponse = FireflyResponse<{
        cursor: number
        size: number
        list: RedPacketSentInfo[] | RedPacketClaimedInfo[]
    }>

    export type ClaimHistoryResponse = FireflyResponse<RedPacketClaimListInfo>

    export type ThemeOptions =
        | {
              rpid: string
          }
        | {
              themeId: string
          }

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
        /** post payload */
        meta: {
            [RedPacketMetaKey]?: object
            [RedPacketNftMetaKey]?: object
            [SolanaRedPacketMetaKey]?: object
        }
        redpacket:
            | {
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
              }
            // In the backend service, it would be null during fetching the redpacket info.
            | null
    }
    export type ParseResponse = FireflyResponse<ParseResult>

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
              type: StrategyType.profileFollow
              payload: ProfileFollowStrategyPayload[]
              result: boolean
          }
        | {
              type: StrategyType.postReaction
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
        | {
              type: StrategyType.nftOwned
              payload: NftOwnedStrategyPayload[]
              result: {
                  hasPassed: boolean
                  nfts: Array<{
                      /** instead of number, it's string */
                      chainId: string
                      contractAddress: HexString
                      tokenIds: string[]
                  }>
              }
          }
        | {
              type: StrategyType.tokens
              payload: TokensStrategyPayload[]
              result: {
                  hasPassed: boolean
                  tokens: Array<{
                      hasPassed: boolean
                      amount: string
                      /** instead of number, it's string */
                      chainId: string
                      contractAddress: HexString
                  }>
              }
          }
    export type CheckClaimStrategyStatusResponse = FireflyResponse<{
        claimStrategyStatus: ClaimStrategyStatus[]
        canClaim: boolean
    }>

    export type ThemeListResponse = FireflyResponse<{
        list: ThemeGroupSettings[]
    }>

    export type ThemeByIdResponse = FireflyResponse<ThemeGroupSettings>

    export type CreateThemeOptions = {
        font_color: string
        /** image url */
        image: string
    }
    export type CreateThemeResponse = FireflyResponse<{ tid: string }>
}

export namespace FireflyTwitterAPI {
    export interface LegacyUserInfo {
        following: boolean
        can_dm: boolean
        can_media_tag: boolean
        /**  "Sat May 02 08:47:28 +0000 2009" */
        created_at: string
        default_profile: boolean
        default_profile_image: boolean
        /** bio */
        description: string
        entities: {
            description?: {
                urls: Array<{
                    display_url: string
                    expanded_url: string
                    url: string
                    indices: [number, number]
                }>
            }
            url?: {
                urls: Array<{
                    display_url: string
                    expanded_url: string
                    url: string
                    indices: [number, number]
                }>
            }
        }
        fast_followers_count: number
        favourites_count: number
        followers_count: number
        friends_count: number
        has_custom_timelines: boolean
        is_translator: boolean
        listed_count: number
        location: string
        media_count: number
        /** nick name */
        name: string
        normal_followers_count: number
        pinned_tweet_ids_str: string[]
        possibly_sensitive: boolean
        profile_banner_url: string
        profile_image_url_https: string
        profile_interstitial_type: string
        screen_name: string
        statuses_count: number
        translator_type: string
        verified: boolean
        want_retweets: boolean
        withheld_in_countries: unknown[]
    }
    export interface TwitterUserInfo {
        __typename: 'User'
        id: string
        rest_id: string
        affiliates_highlighted_label: Record<string, unknown>
        has_graduated_access: boolean
        is_blue_verified: boolean
        profile_image_shape: string
        legacy: LegacyUserInfo
        professional?: {
            rest_id: string
            professional_type: string
            category: Array<{
                id: number
                name: string
                icon_name: string
            }>
        }
        // cspell:disable-next-line
        tipjar_settings: {
            is_enabled: boolean
            ethereum_handle: string
        }
        smart_blocked_by: boolean
        smart_blocking: boolean
        legacy_extended_profile: Record<string, unknown>
        is_profile_translatable: boolean
        has_hidden_subscriptions_on_profile: boolean
        verification_info: {
            is_identity_verified: boolean
        }
        highlights_info: {
            can_highlight_tweets: boolean
            highlighted_tweets: string
        }
        user_seed_tweet_count: number
        business_account: Record<string, unknown>
        creator_subscriptions_count: number
    }

    export type TwitterUserInfoResponse = FireflyResponse<{ data: { user: { result: TwitterUserInfo } } }>

    export type TwitterUserV2Response = FireflyResponse<{ result: { legacy: LegacyUserInfo } }>
}
