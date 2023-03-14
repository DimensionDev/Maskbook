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

    export interface Provider {
        getProfileByHandle: (handle: string) => Promise<Profile>
    }
}
