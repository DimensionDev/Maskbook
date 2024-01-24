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
    export type PlatformType = 'lens' | 'farcaster'

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

    export interface StrategyPayload {
        type: 'profileFollow' | 'postReaction' | 'nftOwned'
        payload: Array<ProfileFollowStrategyPayload | PostReactionStrategyPayload | NftOwnedStrategyPayload>
    }

    export interface ProfileFollowStrategyPayload {
        platform: PlatformType
        profileId: string
    }

    export interface PostReactionStrategyPayload {
        platform: PlatformType
        postId: string
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
        redpacket_id: `0x${string}`
        trans_hash: `0x${string}`
        log_idx: number
        chain_id: string
        redpacket_status: 'VIEW'
        claim_strategy: StrategyPayload[]
    }

    export interface RedPacketClaimedInfo {
        redpacket_id: `0x${string}`
        received_time: string
        rp_msg: string
        token_amounts: string
        token_symbol: string
        token_decimal: number
        token_logo: string
        trans_hash: `0x${string}`
        log_idx: string
        creator: `0x${string}`
        chain_id: string
    }

    export interface ThemeSettings {
        id: number
        payloadUrl: string
        coverUrl: string
    }

    interface Response<T> {
        code: number
        data: T
    }

    export type PublicKeyResponse = Response<{
        publicKey: `0x${string}`
    }>

    export type ClaimResponse = Response<{
        signedMessage: `0x${string}`
    }>

    export type HistoryResponse = Response<{
        cursor: number
        size: number
        list: RedPacketSentInfo[] | RedPacketClaimedInfo[]
    }>
}
