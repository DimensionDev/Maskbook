export namespace LensBaseAPI {
    export interface Profile {
        id: string
        handle: string
        ownedBy: string
        name: string
        picture: {
            original: {
                url: string
            }
        }
        stats: {
            totalFollowers: number
            totalFollowing: number
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

    export interface Provider {
        getProfileByHandle: (handle: string) => Promise<Profile>
    }
}
