export namespace FireflyFarcasterAPI {
    export interface Response<T> {
        code: number
        data?: T
        error?: string[]
    }
    export type CastResponse = Response<Cast>
    export type CastsResponse = Response<{
        casts: Cast[]
        cursor: string
    }>

    export interface User {
        pfp: string
        username: string
        display_name: string
        bio?: string
        following: number
        followers: number
        addresses: string[]
        solanaAddresses: string[]
        fid: string
        isFollowing?: boolean
        /** if followed by the user, no relation to whether you follow the user or not */
        isFollowedBack?: boolean
        isPowerUser?: boolean
    }

    export enum EmbedMediaType {
        IMAGE = 'image',
        NFT = 'nft',
        AUDIO = 'audio',
        FONT = 'font',
        VIDEO = 'video',
        TEXT = 'text',
        FRAME = 'frame',
        CAST = 'cast',
        APPLICATION = 'application',
        UNKNOWN = 'unknown',
    }

    export interface ChannelProfile {
        active_status: LiteralUnion<'active'>
        custody_address: string
        display_name: string
        fid: number
        username: string
        follower_count: number
        following_count: number
        isFollowedBack?: boolean
        isFollowing?: boolean
        pfp_url: string
        power_badge: boolean
        profile?: {
            bio?: {
                text: string
            }
        }
        verifications?: string[]
        verified_addresses?: Record<'eth_addresses' | 'sol_addresses', string[]>
    }

    export interface Channel {
        id: string
        image_url: string
        name: string
        // e.g., 1689888729
        createdAt?: number
        created_at?: number
        description: string
        follower_count?: number
        url: string
        parent_url: string
        lead?: ChannelProfile
        hosts?: ChannelProfile[]
    }

    export interface Cast {
        fid: string
        hash: string
        text: string
        channel?: Channel
        parent_hash?: string
        parent_fid?: string
        parent_url?: string
        embeds: Array<{ url: string }>
        embed_urls?: Array<{ url: string; type?: EmbedMediaType }>
        mentions: string[]
        mentions_positions: number[]
        mentions_user: Array<{
            fid: string
            handle: string
        }>
        created_at: string
        /** example 2024-05-06T10:22:42.152Z */
        deleted_at: string | null
        likeCount: number
        recastCount: number
        quotedCount: number
        /** numeric string */
        replyCount: string
        parentCast?: Cast
        liked: boolean
        recasted: boolean
        bookmarked: boolean
        author?: User
        recastedBy?: User
        timestamp?: string
        rootParentCast?: Cast
        root_parent_hash?: string
        threads?: Cast[]
        quotedCast?: Cast
        sendFrom: {
            display_name: string
            name: string
            bio: string
            fid: number
            pfp: string
        }
    }
}
