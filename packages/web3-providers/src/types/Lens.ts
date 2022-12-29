export namespace LensBaseAPI {
    export interface Profile {
        id: string
        handle: string
        ownedBy: string
    }

    export interface Provider {
        getProfileByHandle: (handle: string) => Promise<Profile>
    }
}
