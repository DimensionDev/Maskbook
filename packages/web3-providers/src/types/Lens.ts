export enum FollowModuleType {
    FeeFollowModule = 'FeeFollowModule',
    ProfileFollowModule = 'ProfileFollowModule',
    RevertFollowModule = 'RevertFollowModule',
}

export type FollowModuleTypedData = {
    profileFollowModule?: {
        profileId: string
    }
    feeFollowModule?: {
        currency: string
        value: string
    }
}

export namespace LensBaseAPI {
    export interface Profile {
        id: string
        handle: string
        ownedBy: string
        name: string
        picture?: {
            original: {
                url: string
            }
        }
        stats: {
            totalFollowers: number
            totalFollowing: number
        }
        followModule?: {
            type: FollowModuleType
            contractAddress?: string
            amount?: {
                asset: {
                    name: string
                    symbol: string
                    decimals: number
                    address: string
                }
                value: string
            }
            recipient: string
        }
    }

    export interface DoesFollow {
        followerAddress: string
        profileId: string
        follows: boolean
    }

    export interface Challenge {
        text: string
    }

    export interface Authenticate {
        accessToken: string
        refreshToken: string
    }

    export interface CreateFollowTypedData {
        id: string
        expiresAt: string
        typedData: {
            domain: {
                name: string
                chainId: number
                version: string
                verifyingContract: string
            }
            types: {
                FollowWithSig: Array<{
                    name: string
                    type: string
                }>
            }
            value: {
                nonce: number
                deadline: number
                profileIds: string[]
                datas: string[]
            }
        }
    }

    export interface CreateUnfollowTypedData {
        id: string
        expiresAt: string
        typedData: {
            domain: {
                name: string
                chainId: number
                version: string
                verifyingContract: string
            }
            types: {
                BurnWithSig: Array<{
                    name: string
                    type: string
                }>
            }
            value: {
                nonce: number
                deadline: number
                tokenId: string
            }
        }
    }

    export interface Provider {
        getProfileByHandle: (handle: string) => Promise<Profile>
        queryDefaultProfileByAddress: (address: string) => Promise<Profile | undefined>
        queryProfilesByAddress: (address: string) => Promise<Profile[]>
        queryFollowStatus: (address: string, profileId: string) => Promise<boolean | undefined>
        queryChallenge: (address: string) => Promise<string>
        authenticate: (address: string, signature: string) => Promise<Authenticate | undefined>
        refresh: (refreshToken: string) => Promise<Authenticate | undefined>
        createFollowTypedData: (
            profileId: string,
            options?: { token: string; followModule?: FollowModuleTypedData },
        ) => Promise<CreateFollowTypedData | undefined>
        createUnfollowTypedData: (
            profileId: string,
            options?: { token: string },
        ) => Promise<CreateUnfollowTypedData | undefined>
    }
}
