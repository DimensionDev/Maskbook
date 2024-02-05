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

    export interface ClaimPlatform {
        platformName: PlatformType
        platformId: string
    }

    export interface RedPacketSentInfo {
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
    }

    export interface RedPacketClaimedInfo {
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
    }

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

    export interface RedPacketClaimListInfo {
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
    }

    export interface ThemeSettings {
        id: string
        payloadUrl: string
        coverUrl: string
    }

    interface Response<T> {
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

    export type ClaimHistroyResponse = Response<RedPacketClaimListInfo>

    export type CheckClaimStrategyStatusOptions = {
        rpid: string
        profile: {
            needLensAndFarcasterHandle?: boolean
            platform: PlatformType
            profileId: string
            lensToken?: string
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

    export type ThemeByIdResponse = Response<{
        /** theme id */
        tid: string
        cover: {
            [key in 'title1' | 'title2' | 'title3' | 'title4']: {
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
    }>
}
