export namespace FireflyBaseAPI {
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
    }

    export type LensResult = Result<LensAccount[]>

    export type VerifyTwitterResult = { error: string } | { data: string[] }

    export interface Provider {
        getLensByTwitterId(twitterHandle: string): Promise<LensAccount[]>
    }
}
