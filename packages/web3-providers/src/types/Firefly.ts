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
}
